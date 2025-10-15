import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { PreferencesFormData } from '@/types';
import { getUserFromToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const tokenUser = getUserFromToken(req);
  const session = await getServerSession(req, res, authOptions);
  
  const userEmail = tokenUser?.email || session?.user?.email;
  
  if (!userEmail) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { preferences } = req.body as {
      preferences: PreferencesFormData;
    };

    if (!preferences) {
      return res.status(400).json({ message: 'Preferences are required' });
    }

    await connectToDatabase();

    // Get current user data
    const currentUser = await User.findOne({ email: userEmail });
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear onboarding answers for disabled features
    const updatedOnboardingAnswers = { ...currentUser.onboardingAnswers };
    
    Object.entries(preferences).forEach(([feature, enabled]) => {
      if (!enabled && updatedOnboardingAnswers[feature as keyof typeof updatedOnboardingAnswers]) {
        // Clear onboarding answers when feature is disabled
        updatedOnboardingAnswers[feature as keyof typeof updatedOnboardingAnswers] = {};
      }
    });

    // Update user with new preferences and cleared onboarding answers
    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      {
        preferences,
        onboardingAnswers: updatedOnboardingAnswers,
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Preferences updated successfully',
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        preferences: updatedUser.preferences,
        onboardingAnswers: updatedUser.onboardingAnswers,
      },
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}