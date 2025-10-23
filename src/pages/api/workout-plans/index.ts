import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import WorkoutPlan from '@/models/WorkoutPlan';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import User from '@/models/User';
import { getUserFromToken } from '@/utils/auth';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    const userId = user._id;

    // Connect to database
    await connectToDatabase();

    // GET: Retrieve all workout plans for the user
    if (req.method === 'GET') {
      const { page = '1', limit = '20', sortBy = 'savedAt', order = 'desc' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      const sortOrder = order === 'asc' ? 1 : -1;

      const workoutPlans = await WorkoutPlan.find({ userId })
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .select('-__v')
        .lean();

      const totalPlans = await WorkoutPlan.countDocuments({ userId });

      return res.status(200).json({
        success: true,
        data: workoutPlans,
        pagination: {
          total: totalPlans,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalPlans / limitNum),
        },
      });
    }

    // POST: Create a new workout plan
    if (req.method === 'POST') {
      const { name, muscleGroups, exercises, isCustom, notes } = req.body;

      // Validation
      if (!name || !muscleGroups || !exercises) {
        return res.status(400).json({ 
          message: 'Missing required fields: name, muscleGroups, exercises' 
        });
      }

      if (!Array.isArray(muscleGroups) || muscleGroups.length === 0) {
        return res.status(400).json({ 
          message: 'muscleGroups must be a non-empty array' 
        });
      }

      if (!Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ 
          message: 'exercises must be a non-empty array' 
        });
      }

      // Calculate total exercises
      const totalExercises = exercises.length;

      // Create new workout plan
      const newWorkoutPlan = new WorkoutPlan({
        userId,
        name,
        muscleGroups,
        // Accept exercises possibly containing configured sets/notes
        exercises: exercises.map((ex: any) => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          gifUrl: ex.gifUrl,
          targetMuscles: ex.targetMuscles || [],
          bodyParts: ex.bodyParts || [],
          equipments: ex.equipments || [],
          secondaryMuscles: ex.secondaryMuscles || [],
          instructions: ex.instructions || [],
          notes: ex.notes || '',
          sets: Array.isArray(ex.sets) ? ex.sets.map((s: any) => ({
            setNumber: s.setNumber,
            weight: typeof s.weight === 'number' ? s.weight : Number(s.weight) || 10,
            reps: typeof s.reps === 'number' ? s.reps : Number(s.reps) || 0,
            restSeconds: typeof s.restSeconds === 'number' ? s.restSeconds : Number(s.restSeconds) || 60,
            isCompleted: !!s.isCompleted,
          })) : [],
        })),
        totalExercises,
        isCustom: isCustom || false,
        notes: notes || '',
        savedAt: new Date(),
        lastModified: new Date(),
      });

      await newWorkoutPlan.save();

      return res.status(201).json({
        success: true,
        message: 'Workout plan saved successfully',
        data: newWorkoutPlan,
      });
    }

    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Workout plans API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

