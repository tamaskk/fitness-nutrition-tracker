import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Workout from '@/models/Workout';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    if (req.method === 'GET') {
      const { q } = req.query;

      const filter: any = { userId: session.user.id };
      if (q && typeof q === 'string' && q.trim().length > 0) {
        filter.$text = { $search: q.trim() };
      }

      const workouts = await Workout.find(filter)
        .sort({ updatedAt: -1 })
        .limit(100);

      return res.status(200).json(workouts);
    }

    if (req.method === 'POST') {
      const { name, description, exercises, estimatedDuration, difficulty, tags, isTemplate } = req.body;

      if (!name || !exercises || !Array.isArray(exercises) || exercises.length === 0 || !estimatedDuration) {
        return res.status(400).json({ message: 'Name, exercises[], and estimatedDuration are required' });
      }

      const workout = await Workout.create({
        userId: session.user.id,
        name: String(name).trim(),
        description: description ? String(description).trim() : undefined,
        exercises,
        estimatedDuration: Number(estimatedDuration),
        difficulty: difficulty || 'beginner',
        tags: Array.isArray(tags) ? tags : [],
        isTemplate: typeof isTemplate === 'boolean' ? isTemplate : true,
      });

      return res.status(201).json(workout);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { name, description, exercises, estimatedDuration, difficulty, tags, isTemplate } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Workout ID is required' });
      }

      const update: any = {};
      if (name) update.name = String(name).trim();
      if (description !== undefined) update.description = description ? String(description).trim() : undefined;
      if (Array.isArray(exercises)) update.exercises = exercises;
      if (estimatedDuration !== undefined) update.estimatedDuration = Number(estimatedDuration);
      if (difficulty) update.difficulty = difficulty;
      if (Array.isArray(tags)) update.tags = tags;
      if (typeof isTemplate === 'boolean') update.isTemplate = isTemplate;

      const workout = await Workout.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        update,
        { new: true, runValidators: true }
      );

      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }

      return res.status(200).json(workout);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Workout ID is required' });
      }

      const workout = await Workout.findOneAndDelete({ _id: id, userId: session.user.id });

      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }

      return res.status(200).json({ message: 'Workout deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Training workouts API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}



