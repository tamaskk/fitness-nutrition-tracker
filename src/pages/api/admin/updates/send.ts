import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Update from '@/models/Update';
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

    const { userIds, title, content, type, priority, actionUrl, actionText } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Get or create admin user for sentBy field
    const adminUser = await getOrCreateAdminUser();

    // Verify all users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({ message: 'Some users not found' });
    }

    // Create updates for all users
    const updates = userIds.map(userId => ({
      userId,
      title,
      content,
      type: type || 'feature',
      priority: priority || 'medium',
      actionUrl,
      actionText,
      sentBy: adminUser._id
    }));

    await Update.insertMany(updates);

    res.status(201).json({
      success: true,
      message: `Update sent to ${userIds.length} user(s)`
    });
  } catch (error) {
    console.error('Error sending updates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
