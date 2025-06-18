import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import RefreshToken from '../../models/db/refreshToken';
import AccessToken from '../../models/db/accessToken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export const refreshAdminToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token missing' });
      return;
    }

    const storedRefresh = await RefreshToken.findOne({ token: refreshToken, role: 'admin' });

    if (!storedRefresh) {
      res.status(403).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    jwt.verify(refreshToken, JWT_SECRET, async (err: any, decoded: any) => {
      if (err || !decoded?.id) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
      }

      // ❗ Check that the decoded ID matches the stored admin ID
      if (storedRefresh.userId.toString() !== decoded.id) 
 {
        return res.status(403).json({ success: false, message: 'Token does not belong to this admin' });
      }

      // ✅ Generate new access token
      const newAccessToken = jwt.sign({ id: decoded.id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

      // ✅ Save new access token in DB
      await AccessToken.create({
  userId: decoded.id,
  role: 'admin',
  token: newAccessToken,
});


      // ✅ Set cookie and send response
      res.cookie('adminToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'strict',
      });

      res.status(200).json({
        success: true,
        message: 'New access token issued successfully',
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    next(error);
  }
};