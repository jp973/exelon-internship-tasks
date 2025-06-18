import express from 'express';
import {
  getAvailableGroups,
  sendJoinRequest,
  getApprovedGroupsForUser
} from '../../controllers/user/userGroup';
import passport from '../../middleware/passport';
import { entryLogger } from '../../middleware/entrypoint';
import { exitLogger } from '../../middleware/exitpoint';

const router = express.Router();

// All routes protected using passport JWT
const protectUser = passport.authenticate('user-bearer', { session: false });

/**
 * @swagger
 * tags:
 *   name: User - Groups
 *   description: APIs for users to view and join groups
 */

/**
 * @swagger
 * /api/member/groups:
 *   get:
 *     summary: Get all available groups
 *     tags: [User - Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       groupName:
 *                         type: string
 *                       maxUsers:
 *                         type: integer
 *                       members:
 *                         type: array
 *                         items:
 *                           type: string
 */
router.get('/groups', entryLogger, protectUser, getAvailableGroups, exitLogger);

/**
 * @swagger
 * /api/member/groups/join:
 *   post:
 *     summary: Send a join request to a group
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
 *               - groupId
 *             properties:
 *               groupId:
 *                 type: string
 *                 example: 64f12345a1b2c3d4e5f67890
 *     responses:
 *       201:
 *         description: Join request sent successfully
 *       400:
 *         description: Join request already sent
 *       404:
 *         description: Group not found
 */
router.post('/groups/join', entryLogger, protectUser, sendJoinRequest, exitLogger);

/**
 * @swagger
 * /api/member/groups/approved:
 *   get:
 *     summary: Get approved groups for the logged-in user
 *     tags: [User - Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of approved groups for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       groupId:
 *                         type: string
 *                       groupName:
 *                         type: string
 */
router.get('/groups/approved', entryLogger,  protectUser, getApprovedGroupsForUser, exitLogger);

export default router;
