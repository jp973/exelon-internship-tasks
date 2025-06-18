//refreshUserToken.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import AccessToken from '../../models/db/accessToken';
import RefreshToken from '../../models/db/refreshToken';
 
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export const refreshUserToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentAccessToken = req.cookies.userToken;
    const refreshToken = req.cookies.refreshToken;

    if (!currentAccessToken || !refreshToken) {
      res.status(401).json({ success: false, message: 'Tokens missing' });
      return;
    }

    // ✅ Check if access token is still valid
    try {
      const decodedAccess = jwt.verify(currentAccessToken, JWT_SECRET) as JwtPayload;
      if (decodedAccess?.id) {
        res.status(200).json({
          success: false,
          message: 'Access token is still valid. No need to refresh.',
        });
        return;
      }
    } catch (err) {
      // Access token is invalid or expired — proceed to check refresh token
    }

    // ✅ Validate refresh token from DB
    const storedRefresh = await RefreshToken.findOne({ token: refreshToken, role: 'user' });
    if (!storedRefresh) {
      res.status(403).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    // ✅ Verify refresh token and issue new access token
    jwt.verify(refreshToken, JWT_SECRET, async (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err || !decoded?.id) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
      }

      if (storedRefresh.userId.toString() !== decoded.id) {
        return res.status(403).json({ success: false, message: 'Token does not belong to this user' });
      }

      const newAccessToken = jwt.sign({ id: decoded.id, role: 'user' }, JWT_SECRET, { expiresIn: '1d' });

      await AccessToken.create({ userId: decoded.id, role: 'user', token: newAccessToken });

      res.cookie('userToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      });

      res.status(200).json({
        success: true,
        message: 'New user access token issued successfully',
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    next(error);
  }
};
