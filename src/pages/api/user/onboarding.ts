import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { PreferencesFormData, OnboardingAnswersFormData } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { preferences, answers, feature, userEmail } = req.body as {
      preferences?: PreferencesFormData;
      answers?: OnboardingAnswersFormData;
      feature?: string;
      userEmail?: string;
    };

    console.log('Onboarding API received:', { preferences, answers, feature, userEmail });

    // Handle both old format (preferences + answers) and new format (feature + answers)
    if (!preferences && !feature) {
      return res.status(400).json({ message: 'Either preferences or feature is required' });
    }

    if (!answers) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    await connectToDatabase();

    let userEmailToUpdate: string;

    // Try to get session first (for existing users)
    const session = await getServerSession(req, res, authOptions);
    if (session?.user?.email) {
      userEmailToUpdate = session.user.email;
    } else if (userEmail) {
      // For registration flow, use the provided email
      userEmailToUpdate = userEmail;
    } else {
      return res.status(401).json({ message: 'Unauthorized - no user email provided' });
    }

    // Update user with preferences and onboarding answers
    let updateData: any = {};
    
    if (preferences) {
      // Old format: update all preferences and answers
      updateData = {
        preferences,
        onboardingAnswers: answers,
      };
    } else if (feature) {
      // New format: update specific feature's onboarding answers
      // The answers object contains the feature-specific answers directly
      updateData = {
        [`onboardingAnswers.${feature}`]: answers,
      };
    }

    console.log('Update data:', updateData);

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmailToUpdate },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: feature ? 'Onboarding answers updated successfully' : 'Onboarding completed successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        preferences: updatedUser.preferences,
        onboardingAnswers: updatedUser.onboardingAnswers,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
