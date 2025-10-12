import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // Find all users that are missing the new fields
    const usersToUpdate = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { lastName: { $exists: false } },
        { country: { $exists: false } },
        { language: { $exists: false } },
        { preferences: { $exists: false } },
        { onboardingAnswers: { $exists: false } }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users to migrate`);

    // Update each user with default values for missing fields
    const updatePromises = usersToUpdate.map(async (user) => {
      const updateData: any = {};

      // Add missing required fields with defaults
      if (!user.firstName) updateData.firstName = 'Unknown';
      if (!user.lastName) updateData.lastName = 'User';
      if (!user.country) updateData.country = 'Other';
      if (!user.language) updateData.language = 'en';

      // Add missing preferences with defaults
      if (!user.preferences) {
        updateData.preferences = {
          mealPlans: false,
          recipes: false,
          trainings: false,
          shoppingList: false,
          priceMonitor: false,
          finance: false,
        };
      }

      // Add missing onboardingAnswers with defaults
      if (!user.onboardingAnswers) {
        updateData.onboardingAnswers = {
          mealPlans: {},
          recipes: {},
          trainings: {},
          shoppingList: {},
          priceMonitor: {},
          finance: {},
        };
      }

      return User.findByIdAndUpdate(user._id, updateData, { new: true });
    });

    const updatedUsers = await Promise.all(updatePromises);

    res.status(200).json({
      message: 'User migration completed successfully',
      migratedCount: updatedUsers.length,
      users: updatedUsers.map(user => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        language: user.language,
        hasPreferences: !!user.preferences,
        hasOnboardingAnswers: !!user.onboardingAnswers,
      }))
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ message: 'Migration failed', error: error.message });
  }
}
