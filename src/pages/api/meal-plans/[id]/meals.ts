import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '@/lib/mongodb';
import MealPlan from '@/models/MealPlan';
import User from '@/models/User';
import { getUserFromToken } from '@/utils/auth';

// PATCH - Update specific meal (mark as completed, add notes, etc.)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    const userId = user._id as string;

    await connectDB();

    const { id } = req.query; // meal plan ID
    const { dayNumber, mealType, updates } = req.body;

    if (!dayNumber || !mealType) {
      return res.status(400).json({ error: 'Day number and meal type are required' });
    }

    const mealPlan = await MealPlan.findOne({ _id: id, userId: userId });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    // Find the specific day
    const day = mealPlan.days.find(d => d.dayNumber === dayNumber);
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    // Find the specific meal
    const meal = day.meals.find(m => m.mealType === mealType);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    // Update meal properties
    if (updates.completed !== undefined) {
      meal.completed = updates.completed;
      if (updates.completed) {
        meal.completedAt = new Date();
      } else {
        meal.completedAt = undefined;
      }
    }
    if (updates.notes !== undefined) {
      meal.notes = updates.notes;
    }
    if (updates.recipeId !== undefined) {
      meal.recipeId = updates.recipeId;
    }

    await mealPlan.save();
    await mealPlan.populate('days.meals.recipeId');

    return res.status(200).json({
      success: true,
      message: 'Meal updated successfully',
      mealPlan,
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
}

