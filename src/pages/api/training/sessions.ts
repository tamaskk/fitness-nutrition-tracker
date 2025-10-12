import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/mongodb';
import WorkoutSession from '@/models/WorkoutSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const sessions = await WorkoutSession.find({ userId: session.user.id })
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
        userId: session.user.id,
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
        { _id: id, userId: session.user.id },
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
        userId: session.user.id
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
