import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import WorkoutSession from '@/models/WorkoutSession';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserFromToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

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

    await connectToDatabase();

    // GET: Retrieve a specific workout session
    if (req.method === 'GET') {
      const workoutSession = await WorkoutSession.findOne({ 
        _id: id, 
        userId 
      }).select('-__v').lean();

      if (!workoutSession) {
        return res.status(404).json({ 
          message: 'Workout session not found or unauthorized' 
        });
      }

      return res.status(200).json({
        success: true,
        data: workoutSession,
      });
    }

    // PUT: Update a workout session
    if (req.method === 'PUT') {
      const body = req.body;

      const workoutSession = await WorkoutSession.findOne({ 
        _id: id, 
        userId 
      });

      if (!workoutSession) {
        return res.status(404).json({ 
          message: 'Workout session not found or unauthorized' 
        });
      }

      // Update fields
      if (body.workoutPlanName) workoutSession.workoutPlanName = body.workoutPlanName;
      if (body.exercises) workoutSession.exercises = body.exercises;
      if (body.startTime) workoutSession.startTime = new Date(body.startTime);
      if (body.endTime) workoutSession.endTime = new Date(body.endTime);
      if (body.durationSeconds) workoutSession.durationSeconds = body.durationSeconds;
      if (body.totalSets !== undefined) workoutSession.totalSets = body.totalSets;
      if (body.completedSets !== undefined) workoutSession.completedSets = body.completedSets;
      if (body.caloriesBurned !== undefined) workoutSession.caloriesBurned = body.caloriesBurned;
      if (body.bodyWeight !== undefined) workoutSession.bodyWeight = body.bodyWeight;
      if (body.status) workoutSession.status = body.status;

      await workoutSession.save();

      return res.status(200).json({
        success: true,
        message: 'Workout session updated successfully',
        data: workoutSession,
      });
    }

    // DELETE: Delete a workout session
    if (req.method === 'DELETE') {
      const workoutSession = await WorkoutSession.findOneAndDelete({ 
        _id: id, 
        userId 
      });

      if (!workoutSession) {
        return res.status(404).json({ 
          message: 'Workout session not found or unauthorized' 
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Workout session deleted successfully',
      });
    }

    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Workout session API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

