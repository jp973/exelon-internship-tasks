import express from 'express';
import passport from 'passport';
import { userLogin, userLogout, getUserData } from '../../controllers/user/userAuth' // adjust path as needed
import { entryLogger } from '../../middleware/entrypoint'; // optional: if you have entry logs
import { exitLogger } from '../../middleware/exitpoint'; // optional: if you use exit logs
import { validateRequest } from '../../middleware/validateRequest';
import { LoginValidation } from '../../validators/loginValidator'; // optional validator
import { refreshUserToken } from '../../controllers/user/refreshUserToken';

const router = express.Router();

const authenticateEither = passport.authenticate(
  ['admin', 'member-bearer', 'user-bearer'] as const,
  { session: false }
);

// USER LOGIN ROUTE

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [User Auth]
 *     summary: User Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: userpassword123
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */

router.post('/login', entryLogger, LoginValidation, validateRequest, userLogin, exitLogger);

// USER LOGOUT ROUTE

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [User Auth]
 *     summary: User Logout
 *     responses:
 *       200:
 *         description: Successful logout
 *       401:
 *         description: Tokens missing
 *       500:
 *         description: Error during logout
 */

router.post('/logout', entryLogger, userLogout, exitLogger);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [User Auth]
 *     summary: Get logged-in user data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User data fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "665ab1b6cdb53e309cf9d123"
 *                     userName:
 *                       type: string
 *                       example: "nithin"
 *                     email:
 *                       type: string
 *                       example: "nithin@example.com"
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.get('/me',entryLogger, authenticateEither, getUserData, exitLogger);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [User Auth]
 *     summary: Refresh user access token
 *     description: Uses a valid refresh token from cookie to issue a new access token.
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Refresh token missing
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', entryLogger, refreshUserToken, exitLogger);

export default router;

