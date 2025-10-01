import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Expense from '@/models/Expense';

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

      const expenses = await Expense.find(query)
        .sort({ createdAt: -1, date: -1 })
        .limit(100);

      res.status(200).json(expenses);
    } else if (req.method === 'POST') {
      const { 
        amount, 
        category, 
        description, 
        date, 
        billImageUrl, 
        extractedItems, 
        billItems,
        isBill,
        location, 
        paymentMethod 
      } = req.body;

      if (!amount || !category || !description) {
        return res.status(400).json({ message: 'Amount, category, and description are required' });
      }

      const expenseData = {
        userId: session.user.id,
        amount: parseFloat(amount),
        category,
        description,
        date: date ? new Date(date) : new Date(),
        billImageUrl,
        extractedItems,
        billItems,
        isBill: isBill || false,
        location,
        paymentMethod: paymentMethod || 'cash',
      };
      
      const expense = await Expense.create(expenseData);

      res.status(201).json(expense);
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const { amount, billItems } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Expense ID is required' });
      }

      const updateData: any = {};
      if (amount !== undefined) updateData.amount = parseFloat(amount);
      if (billItems !== undefined) updateData.billItems = billItems;

      const expense = await Expense.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        updateData,
        { new: true }
      );

      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      res.status(200).json(expense);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: 'Expense ID is required' });
      }

      const expense = await Expense.findOneAndDelete({
        _id: id,
        userId: session.user.id
      });

      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      res.status(200).json({ message: 'Expense deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Expenses API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
