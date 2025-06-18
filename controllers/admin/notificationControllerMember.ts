import { Request, Response } from 'express';
import { sendNotification } from '../../socket/index';
import { MemberNotification } from '../../models/db/MemberNotification';

export const notifyMember = (req: Request, res: Response) => {
  try {
    const { memberId, message, data } = req.body;

    if (!memberId || !message) {
      return res.status(400).json({ error: 'memberId and message are required' });
    }

    // Use memberId directly as it's the MongoDB _id
    sendNotification(memberId, message, data || {} );//'member'

    return res.status(200).json({ message: 'Notification sent to member successfully' });
  } catch (error) {
    console.error('Error sending member notification:', error);
    return res.status(500).json({ error: 'Failed to send member notification' });
  }
};

export const getMemberNotifications = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;

    // Query using userId field which stores _id of the member
    const notifications = await MemberNotification.find({ userId: memberId }).sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching member notifications:', error);
    return res.status(500).json({ error: 'Failed to fetch member notifications' });
  }
};
