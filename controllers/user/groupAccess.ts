import { Request, Response } from 'express';
import { UserType } from '../../models/types/userType';
import Group from '../../models/db/group';
import ApproveRequest from '../../models/db/approveRequest';

// ✅ View all available groups
export const viewGroups = async (_: Request, res: Response) => {
  try {
    const groups = await Group.find().select('name _id'); // 👈 Only return groupName and _id
    res.status(200).json({ groups });
  } catch (error) {
    console.error('❌ Error in viewGroups:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Request access to a group
export const requestAccess = async (req: Request, res: Response) => {
  try {
    const { groupName } = req.body;
    const user = req.user as UserType;

    if (!groupName) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const existingRequest = await ApproveRequest.findOne({
      user: user._id,
      group: group._id,
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Approval request already sent' });
    }

    const newRequest = new ApproveRequest({
      user: user._id,
      userName: user.userName,
      group: group._id,
      groupName: group.name, // 👈 Add this
    });

    await newRequest.save();

    res.status(200).json({ message: 'Approval request sent successfully' });
  } catch (error) {
    console.error('❌ Error in requestAccess:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

// ✅ Get group details only if approved
export const getGroupIfApproved = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserType;

    // Find all approved group requests and populate necessary fields
    const approvedRequests = await ApproveRequest.find({
      user: user._id,
      status: 'approved',
    }).populate({
      path: 'group',
      select: 'name maxUsers messages', // include messages
    });

    if (!approvedRequests || approvedRequests.length === 0) {
      return res.status(403).json({ message: 'No approved groups found for this user' });
    }

    // Extract populated group data
    const groups = approvedRequests
      .filter((req) => req.group)
      .map((req) => req.group);

    res.status(200).json({ groups }); // ✅ Returns all approved groups with messages
  } catch (error) {
    console.error('❌ Error in getGroupIfApproved:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
