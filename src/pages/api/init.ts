import { NextApiRequest, NextApiResponse } from 'next';
import { seedExercises } from '@/utils/seedExercises';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await seedExercises();
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({ message: 'Failed to initialize database' });
  }
}

