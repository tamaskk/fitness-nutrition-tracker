import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import ShoppingListItem from '@/models/ShoppingListItem';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    if (req.method === 'POST') {
      // Add preferredStore field to all existing shopping list items that don't have it
      const result = await ShoppingListItem.updateMany(
        { 
          userId: session.user.id,
          preferredStore: { $exists: false }
        },
        { 
          $set: { preferredStore: '' }
        }
      );

      res.status(200).json({ 
        message: 'Migration completed',
        modifiedCount: result.modifiedCount
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
