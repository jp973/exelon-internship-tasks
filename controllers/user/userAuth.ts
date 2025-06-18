// controllers/userAuthController.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../../models/db/user';
import AccessToken from '../../models/db/accessToken';
import RefreshToken from '../../models/db/refreshToken';
 

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;

// ------------------ USER LOGIN ------------------
export const userLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const accessToken = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

await AccessToken.create({ userId: user._id, role: 'user', token: accessToken });
await RefreshToken.create({ userId: user._id, role: 'user', token: refreshToken });


    res
      .cookie('userToken', accessToken, {
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
        message: 'User login successful',
        accessToken,
        refreshToken,
        userId: user._id,
      });
  } catch (error) {
    next(error);
  }
};

// ------------------ USER LOGOUT ------------------
export const userLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessToken = req.cookies.userToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken || !refreshToken) {
      res.status(401).json({ success: false, message: 'Tokens missing' });
      return;
    }
await AccessToken.deleteOne({ token: accessToken, role: 'user' });
await RefreshToken.deleteOne({ token: refreshToken, role: 'user' });


    res.clearCookie('userToken', {
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
      message: 'User logged out successfully. Tokens cleared.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
};

// ------------------ GET LOGGED-IN USER DATA ------------------
export const getUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user; // comes from passport (user-bearer)

    if (!user || !('_id' in user)) {
      res.status(401).json({ success: false, message: 'Unauthorized access' });
      return;
    }

    const userData = await User.findById(user._id).select('-password'); // Exclude password

    if (!userData) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User data fetched successfully',
      data: userData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
