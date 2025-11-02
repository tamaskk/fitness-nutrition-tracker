import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/mongodb';
import WorkoutSession from '@/models/WorkoutSession';
import { getUserFromToken } from '@/utils/auth';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for JWT token first (for mobile app), then NextAuth session (for web app)
  await connectDB();
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
  const userId = user._id;

  try {

    if (req.method === 'GET') {
      const sessions = await WorkoutSession.find({ userId })
        .sort({ startTime: -1 })
        .limit(50);

      return res.status(200).json(sessions);
    }

    if (req.method === 'POST') {
      const { workoutId, workoutName, startTime, endTime, duration, exercises, totalCaloriesBurned, notes, status } = req.body;

      if (!workoutId || !workoutName || !startTime || !exercises) {
        return res.status(400).json({ message: 'WorkoutId, workoutName, startTime, and exercises are required' });
      }

      const workoutSession = new WorkoutSession({
        userId,
        workoutId,
        workoutName,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined,
        duration,
        exercises,
        totalCaloriesBurned,
        notes,
        status: status || 'processing',
      });

      await workoutSession.save();

      return res.status(201).json(workoutSession);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { exercises, status, endTime, duration, totalCaloriesBurned, notes } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Session ID is required' });
      }

      const updateData: any = {};
      if (exercises) updateData.exercises = exercises;
      if (status) updateData.status = status;
      if (endTime) updateData.endTime = new Date(endTime);
      if (duration) updateData.duration = duration;
      if (totalCaloriesBurned) updateData.totalCaloriesBurned = totalCaloriesBurned;
      if (notes) updateData.notes = notes;

      const workoutSession = await WorkoutSession.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true }
      );

      if (!workoutSession) {
        return res.status(404).json({ message: 'Workout session not found' });
      }

      return res.status(200).json(workoutSession);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: 'Session ID is required' });
      }

      const workoutSession = await WorkoutSession.findOneAndDelete({
        _id: id,
        userId
      });

      if (!workoutSession) {
        return res.status(404).json({ message: 'Workout session not found' });
      }

      return res.status(200).json({ message: 'Workout session deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Workout sessions API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
