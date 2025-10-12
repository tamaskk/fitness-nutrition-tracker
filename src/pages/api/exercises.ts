import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
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
      const { search, type, muscleGroup } = req.query;
      
      let query: any = {};
      
      // Text search
      if (search && typeof search === 'string') {
        query.$text = { $search: search };
      }
      
      // Filter by exercise type
      if (type && typeof type === 'string') {
        query.type = type;
      }
      
      // Filter by muscle group
      if (muscleGroup && typeof muscleGroup === 'string') {
        query.muscleGroups = { $in: [muscleGroup.toLowerCase()] };
      }

      const exercises = await Exercise.find(query).sort({ name: 1 });
      res.status(200).json(exercises);
    } else if (req.method === 'POST') {
      const { 
        name, 
        type, 
        caloriesPerRep, 
        caloriesPerMinute, 
        defaultReps, 
        defaultSets,
        description,
        muscleGroups
      } = req.body;

      if (!name || !type) {
        return res.status(400).json({ message: 'Name and type are required' });
      }

      const exercise = await Exercise.create({
        name,
        type,
        caloriesPerRep,
        caloriesPerMinute,
        defaultReps,
        defaultSets,
        description,
        muscleGroups: muscleGroups || [],
      });

      res.status(201).json(exercise);
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

