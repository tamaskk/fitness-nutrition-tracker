import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Update from '@/models/Update';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Update ID is required' });
    }

    await connectToDatabase();

    const update = await Update.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking update as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
