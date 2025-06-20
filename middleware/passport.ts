// src/middleware/passport.ts
import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Admin from '../models/db/admin';
import Member from '../models/db/member';
import User from '../models/db/user';
import AccessToken from '../models/db/accessToken';
 


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

//Admin Bearer Strategy

passport.use(
  'admin',
  new BearerStrategy(async (token, done) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const stored = await AccessToken.findOne({ token });

      if (!stored) return done(null, false); // Token not found or revoked

      const admin = await Admin.findById(decoded.id);
      if (!admin) return done(null, false);

      return done(null, admin); // Attach admin to req.user
    } catch (err) {
      return done(null, false);
    }
  })
);

//Member Bearer Strategy

passport.use(
  'member-bearer',
  new BearerStrategy(async (token, done) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

      // Check if token exists in DB (revocation support)
      const stored = await AccessToken.findOne({ token ,role: 'member'});
      if (!stored) return done(null, false);

      // Verify member exists
      const member = await Member.findById(decoded.id);
      if (!member) return done(null, false);

      return done(null, member); // --> available as req.user
    } catch (err) {
      return done(null, false);
    }
  })
);

// User Bearer Strategy
passport.use(
  'user-bearer',
  new BearerStrategy(async (token, done) => {
    try {
      // Fallback to req.cookies.userToken if needed
      if (!token) {
        return done(null, false); // BearerStrategy won't pass req
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const stored = await AccessToken.findOne({ token, role: 'user' });
      if (!stored) return done(null, false);

      const user = await User.findById(decoded.id);
      if (!user) return done(null, false);

      return done(null, user);
    } catch (err) {
      return done(null, false);
    }
  })
);

export default passport;
