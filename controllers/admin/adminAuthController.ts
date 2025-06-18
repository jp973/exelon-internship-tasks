import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Admin from '../../models/db/admin';
import AccessToken from '../../models/db/accessToken';
import RefreshToken from '../../models/db/refreshToken'; // ✅ Added refresh token model
import { generateTokens } from '../../utils/generateTokens';



dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in .env');
}

export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Generate tokens
    const accessToken = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '30d' });

    // Save to DB
  await AccessToken.create({ userId: admin._id, role: 'admin', token: accessToken });

await RefreshToken.create({ userId: admin._id, role: 'admin', token: refreshToken });

    // Send as cookies
    res
      .cookie('adminToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'strict',
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'strict',
      })
      .status(200)
      .json({
        success: true,
        message: 'Admin login successful',
        accessToken,
        refreshToken,
        adminId: admin._id,
      });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessToken = req.cookies.adminToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken || !refreshToken) {
      res.status(401).json({ success: false, message: 'Tokens missing' });  
      return;
    }

    
    const decoded: any = jwt.verify(accessToken, JWT_SECRET); // 🔥 decode token
    const userId = decoded.id;
    
    await AccessToken.deleteOne({ userId, role: 'admin', token: accessToken });
    await RefreshToken.deleteOne({ userId, role: 'admin', token: refreshToken });


    res.clearCookie('adminToken', {
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
      message: 'Admin logged out successfully. Tokens cleared.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
};
