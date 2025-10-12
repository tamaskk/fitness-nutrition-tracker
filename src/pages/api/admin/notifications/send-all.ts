import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getOrCreateAdminUser } from '@/utils/adminUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { title, message, type, actionUrl, actionText } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Get or create admin user for sentBy field
    const adminUser = await getOrCreateAdminUser();

    // Get all users
    const users = await User.find({}, '_id');
    const userIds = users.map(user => user._id);

    if (userIds.length === 0) {
      return res.status(400).json({ message: 'No users found' });
    }

    // Create notifications for all users
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type: type || 'info',
      actionUrl,
      actionText,
      sentBy: adminUser._id
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Notification sent to all ${userIds.length} users`
    });
  } catch (error) {
    console.error('Error sending notifications to all users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
