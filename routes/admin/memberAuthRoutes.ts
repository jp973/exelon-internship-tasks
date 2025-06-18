import express from 'express';
import { memberLogin, memberLogout } from '../../controllers/admin/memberAuthController';
import { refreshMemberToken } from '../../controllers/admin/refreshMemberToken';

const router = express.Router();

/**
 * @swagger
 * /api/members/login:
 *   post:
 *     summary: Member login
 *     tags: [Member Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jayyu@example.com
 *               password:
 *                 type: string
 *                 example: passwordsecured1
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', memberLogin);

/**
 * @swagger
 * /api/members/logout:
 *   post:
 *     summary: Member logout
 *     tags: [Member Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Tokens missing or invalid
 */
router.post('/logout', memberLogout);

/**
 * @swagger
 * /api/members/refresh-token:
 *   post:
 *     summary: Refresh member access token
 *     description: Generate a new member access token using a valid refresh token stored in cookies.
 *     tags: [Member Auth]
 *     responses:
 *       200:
 *         description: New member access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Refresh token missing
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', refreshMemberToken);

export default router;
