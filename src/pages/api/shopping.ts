import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import ShoppingListItem from '@/models/ShoppingListItem';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    if (req.method === 'GET') {
      const { purchased } = req.query;
      
      let query: any = { userId: session.user.id };
      
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

      const shoppingItems = items.map(item => ({
        userId: session.user.id,
        name: item.name,
        quantity: item.quantity || '',
        category: item.category || 'general',
        purchased: false,
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

