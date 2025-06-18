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
    req.apiResponse = {
      success: true,
      message: 'Groups retrieved successfully',
      data: groups
    };
    next();
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
      req.apiResponse = {
        success: false,
        message: 'Group not found'
      };
      return next();
    }

    const existingRequest = await JoinRequest.findOne({ groupId, userId });
    if (existingRequest) {
      req.apiResponse = {
        success: false,
        message: 'Join request already sent'
      };
      return next();
    }

    const newRequest = new JoinRequest({
      groupId,
      userId,
      status: 'pending'
    });
    await newRequest.save();

    req.apiResponse = {
      success: true,
      message: 'Join request sent successfully'
    };
    next();
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
      .lean();

    const approvedGroups = approvedRequests.map((request) => {
      const group = request.groupId as unknown as { _id: string; groupName: string };
      return {
        groupId: group._id,
        groupName: group.groupName
      };
    });

    req.apiResponse = {
      success: true,
      message:
        approvedGroups.length > 0
          ? 'Approved groups retrieved successfully'
          : 'Your group approval is pending',
      data: approvedGroups
    };
    next();
  } catch (err) {
    next(err);
  }
};
