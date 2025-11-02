import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import Notification from '@/models/Notification';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    // Handle admin user - get or create admin user for proper ObjectId
    let userId: any = session.user.id;
    if (userId === 'admin') {
      const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
      if (adminUser) {
        userId = adminUser._id;
      } else {
        // If no admin user exists, return empty notifications
        return res.status(200).json({
          success: true,
          notifications: []
        });
      }
    }

    // If the userId is not a valid ObjectId (e.g., Google OAuth subject id),
    // return an empty list instead of throwing a cast error.
    if (!mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(200).json({ success: true, notifications: [] });
    }

    const notifications = await Notification.find({ userId })
      .populate('sentBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      notifications: notifications.map(notification => ({
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        createdAt: notification.createdAt,
        sentBy: notification.sentBy
      }))
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
