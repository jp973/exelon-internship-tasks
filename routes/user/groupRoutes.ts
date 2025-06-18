import express from 'express';
import { viewGroups, requestAccess, getGroupIfApproved } from '../../controllers/user/groupAccess';
import passport from 'passport';
import { entryLogger } from '../../middleware/entrypoint';
import { exitLogger } from '../../middleware/exitpoint';

const router = express.Router();

const protectuser = passport.authenticate('user-bearer', { session: false });
/**
 * @swagger
 * /api/user/groups:
 *   get:
 *     summary: View all available groups
 *     tags: [User - Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array                   
 */
router.get('/',entryLogger,protectuser, viewGroups,exitLogger);

/**
 * @swagger
 * /api/user/groups/request:
 *   post:
 *     summary: Request access to a group
 *     tags: [User - Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupName
 *             properties:
 *               groupName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request submitted successfully
 *       400:
 *         description: Invalid input or already requested
 *       401:
 *         description: Unauthorized
 */
router.post('/request',entryLogger,protectuser, requestAccess,exitLogger);

/**
 * @swagger
 * /api/user/groups/approved-group:
 *   get:
 *     summary: Get all approved group details for the logged-in user
 *     tags: [User - Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of approved groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       maxUsers:
 *                         type: number
 *       403:
 *         description: No approved groups found for the user
 *       500:
 *         description: Internal server error
 */

router.get('/approved-group', protectuser, getGroupIfApproved);


export default router;
