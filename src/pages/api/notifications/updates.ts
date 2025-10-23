import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Update from '@/models/Update';
import User from '@/models/User';
import { getUserFromToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const tokenUser = getUserFromToken(req);
    const session = await getServerSession(req, res, authOptions);
    
    const userEmail = tokenUser?.email || session?.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await connectToDatabase();

    // Handle admin user - get or create admin user for proper ObjectId
    let userId = user?._id as string;
    if (userId === 'admin') {
      const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
      if (adminUser) {
        userId = adminUser._id as string;
      } else {
        // If no admin user exists, return empty updates
        return res.status(200).json({
          success: true,
          updates: []
        });
      }
    }

    const updates = await Update.find({ userId })
      .populate('sentBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      updates: updates.map(update => ({
        _id: update._id,
        title: update.title,
        content: update.content,
        type: update.type,
        priority: update.priority,
        isRead: update.isRead,
        actionUrl: update.actionUrl,
        actionText: update.actionText,
        createdAt: update.createdAt,
        sentBy: update.sentBy
      }))
    });
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
