import { Request, Response, NextFunction } from 'express';
import Group from '../../models/db/group';
import JoinRequest from '../../models/db/joinRequest';

// ----------- Helper Function for Safe User ID Extraction -----------
function getUserId(req: Request): string {
  if (req.user && typeof req.user === 'object' && '_id' in req.user) {
    return (req.user as any)._id;
  }
  throw new Error('Invalid or missing user');
}

// -------------------- GET AVAILABLE GROUPS --------------------
export const getAvailableGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await Group.find().select('groupName maxUsers members');
    res.status(200).json({ success: true, data: groups });
  } catch (err) {
    next(err);
  }
};

// -------------------- SEND JOIN REQUEST --------------------
export const sendJoinRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { groupId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const existingRequest = await JoinRequest.findOne({ groupId, userId });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Join request already sent' });
    }

    const newRequest = new JoinRequest({
      groupId,
      userId,
      status: 'pending'
    });
    await newRequest.save();

    res.status(201).json({ success: true, message: 'Join request sent successfully' });
  } catch (err) {
    next(err);
  }
};

// -------------------- GET APPROVED GROUPS FOR USER --------------------
export const getApprovedGroupsForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);

    const approvedRequests = await JoinRequest.find({
      userId,
      status: 'approved'
    })
      .populate('groupId', 'groupName')
      .lean(); // Optional: use lean to avoid Mongoose Document wrapping

    const approvedGroups = approvedRequests
      .map((request) => {
        const group = request.groupId as unknown as { _id: string; groupName: string };
        return {
          groupId: group._id,
          groupName: group.groupName
        };
      });

    res.status(200).json({ success: true, data: approvedGroups });
  } catch (err) {
    next(err);
  }
};
