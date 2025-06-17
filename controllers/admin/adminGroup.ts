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

// ------------------ CREATE GROUP ------------------
export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupName, maxUsers } = req.body;
    const adminId = getUserId(req);

    const group = await Group.create({
      groupName,
      maxUsers,
      members: [],
      createdBy: adminId,
    });

    res.status(201).json({ success: true, message: 'Group created successfully', data: group });
  } catch (error) {
    next(error);
  }
};

// ------------------ GET ALL GROUPS (WITH MEMBERS) ------------------
export const getAllGroupsWithUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = getUserId(req);

    const groups = await Group.find({ createdBy: adminId })
      .populate('members', 'userName email')
      .exec();

    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
};

// ------------------ GET ALL JOIN REQUESTS ------------------
export const getJoinRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = getUserId(req);

    const groups = await Group.find({ createdBy: adminId }, '_id');
    const groupIds = groups.map(group => group._id);

    const requests = await JoinRequest.find({ groupId: { $in: groupIds }, status: 'pending' })
      .populate('userId', 'userName email')
      .populate('groupId', 'groupName');

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// ------------------ APPROVE JOIN REQUEST ------------------
export const approveRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId } = req.params;

    const request = await JoinRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    }

    const group = await Group.findById(request.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    if (group.members.length >= group.maxUsers) {
      return res.status(400).json({ success: false, message: 'Group is full' });
    }

    group.members.push(request.userId);
    await group.save();

    request.status = 'approved';
    await request.save();

    res.status(200).json({ success: true, message: 'Request approved successfully' });
  } catch (error) {
    next(error);
  }
};

// ------------------ REJECT JOIN REQUEST ------------------
export const rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId } = req.params;

    const request = await JoinRequest.findByIdAndUpdate(
      requestId,
      { status: 'rejected' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({ success: true, message: 'Request rejected successfully' });
  } catch (error) {
    next(error);
  }
};

// ------------------ UPDATE GROUP ------------------
export const updateGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const { groupName, maxUsers } = req.body;
    const adminId = getUserId(req);

    const updatedGroup = await Group.findOneAndUpdate(
      { _id: groupId, createdBy: adminId },
      { groupName, maxUsers },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({ success: false, message: 'Group not found or unauthorized' });
    }

    res.status(200).json({ success: true, data: updatedGroup });
  } catch (error) {
    next(error);
  }
};

// ------------------ DELETE GROUP ------------------
export const deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const adminId = getUserId(req);

    const deleted = await Group.findOneAndDelete({ _id: groupId, createdBy: adminId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Group not found or unauthorized' });
    }

    await JoinRequest.deleteMany({ groupId });

    res.status(200).json({ success: true, message: 'Group and related requests deleted' });
  } catch (error) {
    next(error);
  }
};
