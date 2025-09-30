import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import MealEntry from '@/models/MealEntry';
import WorkoutEntry from '@/models/WorkoutEntry';
import User from '@/models/User';
import { DailySummary } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    await connectToDatabase();

    // Get user for calorie goal
    const user = await User.findById(session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get meals for the date
    const meals = await MealEntry.find({
      userId: session.user.id,
      date: date,
    });

    // Get workouts for the date
    const workouts = await WorkoutEntry.find({
      userId: session.user.id,
      date: date,
    });

    // Calculate totals
    const totalCaloriesConsumed = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalCaloriesBurned = workouts.reduce((sum, workout) => sum + workout.totalCalories, 0);

    const macros = meals.reduce(
      (sum, meal) => ({
        protein: sum.protein + (meal.protein || 0),
        carbs: sum.carbs + (meal.carbs || 0),
        fat: sum.fat + (meal.fat || 0),
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );

    const summary: DailySummary = {
      date: date,
      totalCaloriesConsumed,
      totalCaloriesBurned,
      calorieGoal: user.dailyCalorieGoal || 2000,
      macros,
      mealsCount: meals.length,
      workoutsCount: workouts.length,
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error('Summary API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

