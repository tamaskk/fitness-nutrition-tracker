import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the raw user document to see what's actually stored
    res.status(200).json({
      user: user.toObject(),
      schemaFields: {
        hasFirstName: !!user.firstName,
        hasLastName: !!user.lastName,
        hasCountry: !!user.country,
        hasLanguage: !!user.language,
        hasPreferences: !!user.preferences,
        hasOnboardingAnswers: !!user.onboardingAnswers,
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Debug failed', error: error.message });
  }
}
