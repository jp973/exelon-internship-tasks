import express from 'express';
import { entryLogger } from '../../middleware/entrypoint';
import { exitLogger } from '../../middleware/exitpoint';
import { getPendingRequests, approveUser, rejectUser } from '../../controllers/admin/approveController';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Approvals
 *   description: Admin handling of user group access requests
 */

/**
 * @swagger
 * /api/admin/approvals:
 *   get:
 *     summary: Get all pending approval requests
 *     tags: [Admin Approvals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending approval requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   user:
 *                     type: object
 *                   group:
 *                     type: object
 *                   status:
 *                     type: string
 *                     example: pending
 */

/**
 * @swagger
 * /api/admin/approvals/{requestId}/approve:
 *   patch:
 *     summary: Approve a user group request
 *     tags: [Admin Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         description: ID of the approval request to approve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User request approved successfully
 *       404:
 *         description: Approval request not found
 */

/**
 * @swagger
 * /api/admin/approvals/{requestId}/reject:
 *   patch:
 *     summary: Reject a user group request
 *     tags: [Admin Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         description: ID of the approval request to reject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User request rejected successfully
 *       404:
 *         description: Approval request not found
 */

router.get('/',entryLogger, getPendingRequests,exitLogger);
router.patch('/:requestId/approve', entryLogger,approveUser,exitLogger);
router.patch('/:requestId/reject', entryLogger,rejectUser,exitLogger);

export default router;
