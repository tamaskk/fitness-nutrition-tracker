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

    // Connect to database
    await connectToDatabase();

    // GET: Retrieve a specific workout plan
    if (req.method === 'GET') {
      const workoutPlan = await WorkoutPlan.findOne({ 
        _id: id, 
        userId 
      }).select('-__v').lean();

      if (!workoutPlan) {
        return res.status(404).json({ 
          message: 'Workout plan not found or unauthorized' 
        });
      }

      return res.status(200).json({
        success: true,
        data: workoutPlan,
      });
    }

    // PUT: Update a workout plan
    if (req.method === 'PUT') {
      const { name, muscleGroups, exercises, isCustom, notes } = req.body;

      console.log('comes here because of the put');
      const workoutPlan = await WorkoutPlan.findOne({ 
        _id: id, 
        userId 
      });

      if (!workoutPlan) {
        return res.status(404).json({ 
          message: 'Workout plan not found or unauthorized' 
        });
      }

      // Update fields
      if (name) workoutPlan.name = name;
      if (muscleGroups) workoutPlan.muscleGroups = muscleGroups;
      if (exercises) {
        workoutPlan.exercises = exercises.map((ex: any) => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          gifUrl: ex.gifUrl,
          targetMuscles: ex.targetMuscles || [],
          bodyParts: ex.bodyParts || [],
          equipments: ex.equipments || [],
          secondaryMuscles: ex.secondaryMuscles || [],
          instructions: ex.instructions || [],
          notes: ex.notes || '',
          sets: Array.isArray(ex.sets) ? ex.sets.map((s: any, index: number) => ({
            setNumber: s.setNumber !== undefined ? s.setNumber : index + 1,
            weight: typeof s.weight === 'number' ? s.weight : Number(s.weight) || 10,
            reps: typeof s.reps === 'number' ? s.reps : Number(s.reps) || 0,
            restSeconds: typeof s.restSeconds === 'number' ? s.restSeconds : Number(s.restSeconds) || 60,
            isCompleted: !!s.isCompleted,
          })) : [],
        }));
        workoutPlan.totalExercises = exercises.length;
      }
      if (typeof isCustom === 'boolean') workoutPlan.isCustom = isCustom;
      if (notes !== undefined) workoutPlan.notes = notes;
      
      workoutPlan.lastModified = new Date();

      await workoutPlan.save();

      return res.status(200).json({
        success: true,
        message: 'Workout plan updated successfully',
        data: workoutPlan,
      });
    }

    // DELETE: Delete a workout plan
    if (req.method === 'DELETE') {
      const workoutPlan = await WorkoutPlan.findOneAndDelete({ 
        _id: id, 
        userId 
      });

      if (!workoutPlan) {
        return res.status(404).json({ 
          message: 'Workout plan not found or unauthorized' 
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Workout plan deleted successfully',
      });
    }

    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Workout plan API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

