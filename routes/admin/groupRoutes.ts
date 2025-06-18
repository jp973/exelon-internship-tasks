import express from 'express';
import { entryLogger } from '../../middleware/entrypoint';
import { exitLogger } from '../../middleware/exitpoint';
import { createGroup, getGroups, updateGroup, deleteGroup } from '../../controllers/admin/groupController';
import passport from 'passport';
const router = express.Router();
const protectAdmin = passport.authenticate('bearer', { session: false });
/**
 * @swagger
 * tags:
 *   name: Admin Groups
 *   description: Admin group management APIs
 */

/**
 * @swagger
 * /api/admin/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Admin Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - maxUsers
 *             properties:
 *               name:
 *                 type: string
 *                 example: Group A
 *               maxUsers:
 *                 type: number
 *                 example: 10
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Invalid request body
 *
 *   get:
 *     summary: Get all groups
 *     tags: [Admin Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all groups
 */

/**
 * @swagger
 * /api/admin/groups/{id}:
 *   put:
 *     summary: Update a group by ID
 *     tags: [Admin Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the group to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               maxUsers:
 *                 type: number
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       404:
 *         description: Group not found
 *
 *   delete:
 *     summary: Delete a group by ID
 *     tags: [Admin Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the group to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Group deleted successfully
 *       404:
 *         description: Group not found
 */

router.post('/',entryLogger,protectAdmin, createGroup,exitLogger);
router.get('/',entryLogger,protectAdmin, getGroups,exitLogger);
router.put('/:id',entryLogger,protectAdmin, updateGroup,exitLogger);
router.delete('/:id',entryLogger,protectAdmin, deleteGroup,exitLogger);

export default router;