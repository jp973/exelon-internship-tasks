import { Request, Response, NextFunction } from 'express';
import Group from '../../models/db/group';
import User from '../../models/db/user';
import { sendNotification } from '../../socket';

// Utility to safely extract userId from req.user
function getUserId(req: Request): string {
  if (req.user && typeof req.user === 'object' && '_id' in req.user) {
    return (req.user as any)._id;
  }
  throw new Error('Invalid or missing user');
}


 // Admin sends a socket notification to all approved members in their groups.
 
export const notifyGroupMembersViaSocket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = getUserId(req);
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      req.apiResponse = {
        success: false,
        message: 'Notification message is required.',
      };
      return next();
    }

    const groups = await Group.find({ createdBy: adminId });
    if (!groups.length) {
      req.apiResponse = {
        success: false,
        message: 'No groups found for this admin.',
      };
      return next();
    }

    let totalNotified = 0;

    for (const group of groups) {
      const approvedMembers = await User.find({
        _id: { $in: group.members },
      });

      approvedMembers.forEach((user) => {
        sendNotification(
          user._id.toString(),
          message,
          {
            groupId: group._id,
            groupName: group.groupName,
          },
          'user'
        );
      });

      // Save the message in the group's notifications array
      group.notifications.push({
        message,
        timestamp: new Date(),
      });

      await group.save();
      totalNotified += approvedMembers.length;
    }

    req.apiResponse = {
      success: true,
      message: `Socket notification sent to ${totalNotified} approved users.`,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const notifySpecificGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = getUserId(req);
    const groupId = req.params.groupId; // ✅ Use from route param
    const { message } = req.body;

    // Validate inputs
    if (!groupId || !message || typeof message !== 'string') {
      req.apiResponse = {
        success: false,
        message: 'Both groupId (from route) and message (in body) are required.',
      };
      return next();
    }

    // Check if group belongs to this admin
    const group = await Group.findOne({ _id: groupId, createdBy: adminId });
    if (!group) {
      req.apiResponse = {
        success: false,
        message: 'Group not found or not created by you.',
      };
      return next();
    }

    // Get all approved users in the group
    const approvedMembers = await User.find({
      _id: { $in: group.members }
    });

    // Send socket notification to each approved member
    approvedMembers.forEach(user => {
      sendNotification(
        user._id.toString(),
        message,
        {
          groupId: group._id,
          groupName: group.groupName
        },
        'user'
      );
    });

    sendNotification(
      group._id.toString(),
      message,
      {
        groupId: group._id,
        groupName: group.groupName
      },
      'group'
    );

    // Save the message in the group notifications array
    group.notifications.push({
      message,
      timestamp: new Date(),
    });

    await group.save();

    req.apiResponse = {
      success: true,
      message:` Notification sent to ${approvedMembers.length} members in group ${group.groupName}.`,
    };
    next();
  } catch (error) {
    console.error('Error in notifySpecificGroup:', error);
    next(error);
  }
};

export const getGroupNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = getUserId(req);
    const groups = await Group.find({ createdBy: adminId });

    const result = groups.map(group => ({
      groupId: group._id,
      groupName: group.groupName,
      notifications: group.notifications,
    }));

    req.apiResponse = {
      success: true,
      message: result.length > 0 ? 'Group notifications fetched.' : 'No notifications found.',
      data: result,
    };
    next();
  } catch (err) {
    next(err);
  }
};
