import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Exercise from '@/models/Exercise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    if (req.method === 'GET') {
      const exercises = await Exercise.find({ userId: session.user.id })
        .sort({ name: 1 })
        .limit(100);

      res.status(200).json(exercises);
    } else if (req.method === 'POST') {
      const { 
        name, 
        category, 
        muscleGroups, 
        description, 
        equipment, 
        difficulty,
        instructions,
        reps,
        sets,
        weight,
        rest,
        image
      } = req.body;

      console.log({
        name, 
        category, 
        muscleGroups, 
        description, 
        equipment, 
        difficulty,
        instructions,
        reps,
        sets,
        weight,
        rest
      })

      // if (!name || !muscleGroups || muscleGroups.length === 0) {
      //   return res.status(400).json({ message: 'Name and muscle groups are required' });
      // }

      const exercise = await Exercise.create({
        userId: session.user.id,
        name,
        category,
        muscleGroups,
        description: description?.trim(),
        equipment: equipment?.trim(),
        difficulty: difficulty || 'beginner',
        instructions: instructions || [],
        reps: reps || 10,
        sets: sets || 3,
        weight: weight || 0,
        rest: rest || 60,
        image
      });

      res.status(201).json(exercise);
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const { 
        name, 
        category, 
        muscleGroups, 
        description, 
        equipment, 
        difficulty,
        instructions,
        reps,
        sets,
        weight,
        rest
      } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Exercise ID is required' });
      }

      // if (!name || !muscleGroups || muscleGroups.length === 0) {
      //   return res.status(400).json({ message: 'Name and muscle groups are required' });
      // }

      const exercise = await Exercise.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        {
          name: name?.trim(),
          category,
          muscleGroups,
          description: description?.trim(),
          equipment: equipment?.trim(),
          difficulty: difficulty || 'beginner',
          instructions: instructions || [],
          reps: reps || 10,
          sets: sets || 3,
          weight: weight || 0,
          rest: rest || 60,
        },
        { new: true, runValidators: true }
      );

      if (!exercise) {
        return res.status(404).json({ message: 'Exercise not found' });
      }

      res.status(200).json(exercise);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: 'Exercise ID is required' });
      }

      const exercise = await Exercise.findOneAndDelete({
        _id: id,
        userId: session.user.id
      });

      if (!exercise) {
        return res.status(404).json({ message: 'Exercise not found' });
      }

      res.status(200).json({ message: 'Exercise deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Exercises API error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      if (duplicateField === 'name') {
        return res.status(400).json({ 
          message: 'Már létezik gyakorlat ezzel a névvel. Kérjük, válassz másik nevet.' 
        });
      }
      return res.status(400).json({ 
        message: 'Ezt a gyakorlatot már hozzáadtad.' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validációs hiba: ' + validationErrors.join(', ') 
      });
    }
    
    res.status(500).json({ message: 'Belső szerver hiba történt' });
  }
}
