import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import WorkoutSession from '@/models/WorkoutSession';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserFromToken } from '@/utils/auth';
import connectDB from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log('MongoDB connected');
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

    if (req.method === 'GET') {
      const { page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const sessions = await WorkoutSession.find({ userId })
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v')
        .lean();

      const total = await WorkoutSession.countDocuments({ userId });
      return res.status(200).json({
        success: true,
        data: sessions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    if (req.method === 'POST') {
      const body = req.body;
      
      // Basic validation
      const required = ['workoutPlanName', 'exercises', 'startTime', 'endTime', 'durationSeconds'];
      for (const k of required) {
        if (body[k] === undefined || body[k] === null) {
          return res.status(400).json({ message: `Missing field: ${k}` });
        }
      }

      console.log('body.bodyWeight', body.bodyWeight);
      
      const sessionData = {
        userId,
        planId: body.planId,
        workoutPlanName: body.workoutPlanName,
        exercises: body.exercises,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        durationSeconds: body.durationSeconds,
        totalSets: body.totalSets || 0,
        completedSets: body.completedSets || 0,
        caloriesBurned: body.caloriesBurned || 0,
        bodyWeight: body.bodyWeight,
        status: 'completed',
      };
      
      console.log('Creating workout session with data:', JSON.stringify(sessionData, null, 2));
      
      const workoutSession = new WorkoutSession(sessionData);
      
      console.log('Before save - bodyWeight:', workoutSession.bodyWeight);
      await workoutSession.save();
      console.log('After save - bodyWeight:', workoutSession.bodyWeight);
      
      return res.status(201).json({ success: true, data: workoutSession });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Workout sessions API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
