import express from 'express';
import { adminLogin, adminLogout } from '../../controllers/admin/adminAuthController';
import { refreshAdminToken } from '../../controllers/admin/refreshAdminTocken';
import groupRoutes from './groupRoutes';

 

const router = express.Router();
 
/**
 * @swagger
 * tags:
 *   name: AdminAuth
 *   description: Admin authentication endpoints
 */


/**
 * @swagger
 * 
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [AdminAuth]
 *     description: Log in as an admin and receive a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin1@example.com
 *               password:
 *                 type: string
 *                 example: admin@123
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 message:
 *                   type: string
 *                   example: Admin login successful
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 */
router.post('/login', adminLogin);


/**
 * @swagger
 * /api/admin/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [AdminAuth]
 *     description: Log out the admin and blacklist the JWT token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Token already logged out
 *       401:
 *         description: No token provided
 */
router.post('/logout', adminLogout);


/**
 * @swagger
 * /api/admin/refresh-token:
 *   post:
 *     summary: Refresh admin access token
 *     tags: [AdminAuth]
 *     description: Generate a new access token using a valid refresh token from cookies.
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
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 message:
 *                   type: string
 *                   example: New access token issued
 *       401:
 *         description: Refresh token missing
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', refreshAdminToken);

router.use('/', groupRoutes);
 
export default router;
