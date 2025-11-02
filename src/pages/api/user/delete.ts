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
import { getUserFromToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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

    const { confirm } = req.query;
    if (confirm !== 'true') {
      return res.status(400).json({ message: 'Confirmation required' });
    }

    await connectToDatabase();

    await Promise.all([
      Recipe.deleteMany({ userId: user._id }),
      MealEntry.deleteMany({ userId: user._id }),
      Expense.deleteMany({ userId: user._id }),
      Income.deleteMany({ userId: user._id }),
      ShoppingListItem.deleteMany({ userId: user._id }),
    ]);

    await User.findByIdAndDelete(user._id);

    return res.status(200).json({ message: 'Account and associated data deleted' });
  } catch (error) {
    console.error('Account deletion error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}



