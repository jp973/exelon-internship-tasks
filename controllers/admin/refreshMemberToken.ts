import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import AccessToken from '../../models/db/accessToken';
import RefreshToken from '../../models/db/refreshToken'; // ✅ Added refresh token model
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export const refreshMemberToken = async (
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

    // 1. Check the refresh token exists in DB
    const stored = await RefreshToken.findOne({ token: refreshToken, role: 'member' });

    if (!stored) {
      res.status(403).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    // 2. Verify the JWT
    jwt.verify(refreshToken, JWT_SECRET, async (err:any, decoded: any) => {
      if (err || !decoded?.id) {
        return res
          .status(403)
          .json({ success: false, message: 'Invalid or expired refresh token' });
      }

      // 3. Ensure token really belongs to this member
      if (stored.userId.toString() !== decoded.id) {
        return res
          .status(403)
          .json({ success: false, message: 'Token does not belong to this member' });
      }

      // 4. Generate a new access token
      const newAccessToken = jwt.sign(
        { id: decoded.id, role: 'member' },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // 5. Persist it
      await AccessToken.create({
  userId: decoded.id,
  role: 'member',
  token: newAccessToken,
});


      // 6. Set cookie and respond
      res
        .cookie('memberToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 1 day
          sameSite: 'strict',
        })
        .status(200)
        .json({
          success: true,
          message: 'New member access token issued successfully',
          accessToken: newAccessToken,
        });
    });
  } catch (error) {
    next(error);
  }
};
