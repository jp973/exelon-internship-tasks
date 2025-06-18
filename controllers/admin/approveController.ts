import ApproveRequest from '../../models/db/approveRequest';
import { Request, Response } from 'express';

// Get all pending approval requests
export const getPendingRequests = async (_: Request, res: Response) => {
  try {
    const pending = await ApproveRequest.find({ status: 'pending' })
      .populate('group')
      .populate('user');
    res.json(pending);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Approve a request (only if status is still pending)
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const request = await ApproveRequest.findById(requestId).populate('group');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Cannot approve a ${request.status} request` });
    }

    request.status = 'approved';
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reject a request (only if status is still pending)
export const rejectUser = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const request = await ApproveRequest.findById(requestId).populate('group');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject a ${request.status} request` });
    }

    request.status = 'rejected';
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
