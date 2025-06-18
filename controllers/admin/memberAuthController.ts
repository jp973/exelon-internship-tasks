import { Request, Response, NextFunction } from 'express';
import Member from '../../models/db/member';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import AccessToken from '../../models/db/accessToken';
import RefreshToken from '../../models/db/refreshToken';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;

// ------------------ LOGIN ------------------
export const memberLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const member = await Member.findOne({ email });
    if (!member) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const accessToken = jwt.sign({ id: member._id, role: 'member' }, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ id: member._id }, JWT_SECRET, { expiresIn: '30d' });

    await AccessToken.create({ userId: member._id, role: 'member', token: accessToken });
    await RefreshToken.create({ userId: member._id, role: 'member', token: refreshToken });

    res
      .cookie('memberToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      })
      .status(200)
      .json({
        success: true,
        message: 'Member login successful',
        accessToken,
        refreshToken,
        memberId: member._id,
      });
  } catch (error) {
    next(error);
  }
};

// ------------------ LOGOUT ------------------
export const memberLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessToken = req.cookies.memberToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken || !refreshToken) {
      res.status(401).json({ success: false, message: 'Tokens missing' });
      return;
    }

    const decoded = jwt.verify(accessToken, JWT_SECRET) as { id: string };
    await AccessToken.deleteOne({ userId: decoded.id, role: 'member', token: accessToken });
    await RefreshToken.deleteOne({ userId: decoded.id, role: 'member', token: refreshToken });

    res.clearCookie('memberToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Member logged out successfully. Tokens cleared.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
};
