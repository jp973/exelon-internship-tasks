import express from 'express';
import {
  createGroup,
  getAllGroupsWithUsers,
  getJoinRequests,
  approveRequest,
  rejectRequest,
  updateGroup,
  deleteGroup
} from '../../controllers/admin/adminGroup';
import passport from '../../middleware/passport';

const router = express.Router();

// Apply JWT protection to all routes
const protectAdmin = passport.authenticate('admin', { session: false });

/**
 * @swagger
 * tags:
 *   name: Admin - Groups
 *   description: Admin group and join request management
 */

/**
 * @swagger
 * /api/admin/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Admin - Groups]
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
 *               - maxUsers
 *             properties:
 *               groupName:
 *                 type: string
 *               maxUsers:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Group created successfully
 *       500:
 *         description: Server error
 */
router.post('/groups',protectAdmin, createGroup);

/**
 * @swagger
 * /api/admin/groups:
 *   get:
 *     summary: Get all groups created by the admin with members
 *     tags: [Admin - Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups with members
 *       500:
 *         description: Server error
 */
router.get('/groups',protectAdmin, getAllGroupsWithUsers);

/**
 * @swagger
 * /api/admin/groups/requests:
 *   get:
 *     summary: Get all pending join requests for admin's groups
 *     tags: [Admin - Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of join requests
 *       500:
 *         description: Server error
 */
router.get('/groups/requests',protectAdmin, getJoinRequests);

/**
 * @swagger
 * /api/admin/groups/requests/{requestId}/approve:
 *   patch:
 *     summary: Approve a join request
 *     tags: [Admin - Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request approved
 *       400:
 *         description: Group full or invalid request
 *       404:
 *         description: Not found
 */
router.patch('/groups/requests/:requestId/approve', protectAdmin,  approveRequest);

/**
 * @swagger
 * /api/admin/groups/requests/{requestId}/reject:
 *   patch:
 *     summary: Reject a join request
 *     tags: [Admin - Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request rejected
 *       404:
 *         description: Request not found
 */
router.patch('/groups/requests/:requestId/reject', protectAdmin, rejectRequest);

/**
 * @swagger
 * /api/admin/groups/{groupId}:
 *   put:
 *     summary: Update a group
 *     tags: [Admin - Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupName:
 *                 type: string
 *               maxUsers:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Group updated
 *       404:
 *         description: Group not found or unauthorized
 */
router.put('/groups/:groupId', protectAdmin, updateGroup);

/**
 * @swagger
 * /api/admin/groups/{groupId}:
 *   delete:
 *     summary: Delete a group and its join requests
 *     tags: [Admin - Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group deleted
 *       404:
 *         description: Group not found or unauthorized
 */
router.delete('/groups/:groupId', protectAdmin, deleteGroup);

export default router;
