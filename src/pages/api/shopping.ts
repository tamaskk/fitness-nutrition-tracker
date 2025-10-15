import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import ShoppingListItem from '@/models/ShoppingListItem';
import { getUserFromToken } from '@/utils/auth';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const tokenUser = getUserFromToken(req);
    const session = await getServerSession(req, res, authOptions);
    
    const userEmail = tokenUser?.email || session?.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  

    await connectToDatabase();

    if (req.method === 'GET') {
      const { purchased } = req.query;

      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const query: { userId: typeof user._id; purchased?: boolean } = { userId: user._id };
      
      if (purchased !== undefined) {
        query.purchased = purchased === 'true';
      }

      const items = await ShoppingListItem.find(query).sort({ addedAt: -1 });
      res.status(200).json(items);
    } else if (req.method === 'POST') {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ message: 'Items array is required' });
      }

      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const shoppingItems = items.map(item => ({
        userId: user._id,
        name: item.name,
        quantity: item.quantity || '',
        category: item.category || 'general',
        purchased: false,
        extraInfo: item.extraInfo || '',
        preferredStore: item.preferredStore || '',
      }));

      const createdItems = await ShoppingListItem.insertMany(shoppingItems);
      res.status(201).json(createdItems);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Shopping API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

