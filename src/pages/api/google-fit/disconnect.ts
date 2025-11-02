import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    // Clear stored Google Fit connection on the user document
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $unset: { googleFitConnection: '' } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Disconnect Google Fit error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


