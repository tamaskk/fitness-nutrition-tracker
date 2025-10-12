import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Recipe from '@/models/Recipe';
import MealEntry from '@/models/MealEntry';
import Expense from '@/models/Expense';
import Income from '@/models/Income';
import ShoppingListItem from '@/models/ShoppingListItem';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { confirm } = req.query;
    if (confirm !== 'true') {
      return res.status(400).json({ message: 'Confirmation required' });
    }

    await connectToDatabase();

    const userId = session.user.id;

    await Promise.all([
      Recipe.deleteMany({ userId }),
      MealEntry.deleteMany({ userId }),
      Expense.deleteMany({ userId }),
      Income.deleteMany({ userId }),
      ShoppingListItem.deleteMany({ userId }),
    ]);

    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: 'Account and associated data deleted' });
  } catch (error) {
    console.error('Account deletion error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}



