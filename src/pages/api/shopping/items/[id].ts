import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import ShoppingListItem from '@/models/ShoppingListItem';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    await connectToDatabase();

    if (req.method === 'PUT') {
      const { purchased, name, quantity, category, extraInfo, preferredStore } = req.body;

      const updateData: any = {};
      if (purchased !== undefined) updateData.purchased = purchased;
      if (name !== undefined) updateData.name = name;
      if (quantity !== undefined) updateData.quantity = quantity;
      if (category !== undefined) updateData.category = category;
      if (extraInfo !== undefined) updateData.extraInfo = extraInfo;
      if (preferredStore !== undefined) updateData.preferredStore = preferredStore;

      const item = await ShoppingListItem.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        updateData,
        { new: true }
      );

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      res.status(200).json(item);
    } else if (req.method === 'DELETE') {
      const item = await ShoppingListItem.findOneAndDelete({
        _id: id,
        userId: session.user.id,
      });

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      res.status(200).json({ message: 'Item deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Shopping item API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

