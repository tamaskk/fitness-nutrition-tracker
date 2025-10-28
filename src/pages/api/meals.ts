import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import MealEntry from '@/models/MealEntry';
import { getUserFromToken } from '@/utils/auth';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    
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

    const userId = user._id as string;


    if (req.method === 'GET') {
      const { date } = req.query;

      console.log('GET /api/meals - Date:', date);
      
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ message: 'Date parameter is required' });
      }

      console.log('GET /api/meals - User ID:', userId);

      // Query all meals for the same day (ignoring time part of createdAt)
      // createdAt is a Date, date is a 'YYYY-MM-DD' string
      const startOfDay = new Date(date + "T00:00:00.000Z");
      const endOfDay = new Date(date + "T23:59:59.999Z");
      const meals = await MealEntry.find({
        userId: userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }).sort({ createdAt: 1 });

      console.log('GET /api/meals - Meals:', meals);

      res.status(200).json(meals);
    } else if (req.method === 'POST') {
      const { name, mealType, quantityGrams, calories, protein, carbs, fat, date } = req.body;

      console.log('POST /api/meals - Body:', req.body);

      if (!name || !mealType || !calories) {
        return res.status(400).json({ message: 'Name, meal type, and calories are required' });
      }

      const meal = await MealEntry.create({
        userId: userId,
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
        userId: userId,
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

