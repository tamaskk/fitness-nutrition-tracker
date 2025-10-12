import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Income from '@/models/Income';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    if (req.method === 'GET') {
      const { startDate, endDate, category } = req.query;
      
      let query: any = { userId: session.user.id };
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate as string);
        if (endDate) query.date.$lte = new Date(endDate as string);
      }
      
      if (category) {
        query.category = category;
      }

      const income = await Income.find(query)
        .sort({ date: -1 })
        .limit(100);

      res.status(200).json(income);
    } else if (req.method === 'POST') {
      const { amount, category, description, date, source } = req.body;

      if (!amount || !category || !description) {
        return res.status(400).json({ message: 'Amount, category, and description are required' });
      }

      const income = await Income.create({
        userId: session.user.id,
        amount: parseFloat(amount),
        category,
        description,
        date: date ? new Date(date) : new Date(),
        source,
      });

      res.status(201).json(income);
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const { amount, category, description, date, source } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Income ID is required' });
      }

      const updateData: any = {};
      if (amount !== undefined) updateData.amount = parseFloat(amount);
      if (category !== undefined) updateData.category = category;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = new Date(date);
      if (source !== undefined) updateData.source = source;

      const income = await Income.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        updateData,
        { new: true }
      );

      if (!income) {
        return res.status(404).json({ message: 'Income not found' });
      }

      res.status(200).json(income);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: 'Income ID is required' });
      }

      const income = await Income.findOneAndDelete({
        _id: id,
        userId: session.user.id
      });

      if (!income) {
        return res.status(404).json({ message: 'Income not found' });
      }

      res.status(200).json({ message: 'Income deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Income API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
