import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import MealEntry from '@/models/MealEntry';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    if (req.method === 'GET') {
      const { date } = req.query;
      
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ message: 'Date parameter is required' });
      }

      const meals = await MealEntry.find({
        userId: session.user.id,
        date: date,
      }).sort({ createdAt: 1 });

      res.status(200).json(meals);
    } else if (req.method === 'POST') {
      const { name, mealType, quantityGrams, calories, protein, carbs, fat, date } = req.body;

      if (!name || !mealType || !calories) {
        return res.status(400).json({ message: 'Name, meal type, and calories are required' });
      }

      const meal = await MealEntry.create({
        userId: session.user.id,
        name,
        mealType,
        quantityGrams,
        calories,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        date: date || new Date().toISOString().split('T')[0],
      });

      res.status(201).json(meal);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Meal ID is required' });
      }

      const meal = await MealEntry.findOneAndDelete({
        _id: id,
        userId: session.user.id,
      });

      if (!meal) {
        return res.status(404).json({ message: 'Meal not found' });
      }

      res.status(200).json({ message: 'Meal deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Meals API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

