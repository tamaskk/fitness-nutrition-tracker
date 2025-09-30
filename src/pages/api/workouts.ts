import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import WorkoutEntry from '@/models/WorkoutEntry';

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

      const workouts = await WorkoutEntry.find({
        userId: session.user.id,
        date: date,
      }).sort({ createdAt: 1 });

      res.status(200).json(workouts);
    } else if (req.method === 'POST') {
      const { exercises, date, notes } = req.body;

      if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ message: 'Exercises array is required' });
      }

      // Calculate total calories
      const totalCalories = exercises.reduce((sum, exercise) => sum + exercise.caloriesBurned, 0);

      const workout = await WorkoutEntry.create({
        userId: session.user.id,
        date: date || new Date().toISOString().split('T')[0],
        exercises,
        totalCalories,
        notes,
      });

      res.status(201).json(workout);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Workout ID is required' });
      }

      const workout = await WorkoutEntry.findOneAndDelete({
        _id: id,
        userId: session.user.id,
      });

      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }

      res.status(200).json({ message: 'Workout deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Workouts API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

