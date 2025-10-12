import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if user is admin
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Get user by ID
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          country: user.country,
          language: user.language,
          preferences: user.preferences,
          onboardingAnswers: user.onboardingAnswers,
          age: user.age,
          gender: user.gender,
          weightKg: user.weightKg,
          heightCm: user.heightCm,
          dailyCalorieGoal: user.dailyCalorieGoal,
          createdAt: user.createdAt,
        }
      });
    } else if (req.method === 'PUT') {
      // Update user
      const {
        firstName,
        lastName,
        email,
        country,
        language,
        age,
        gender,
        weightKg,
        heightCm,
        dailyCalorieGoal,
        preferences,
      } = req.body;

      const updateData: any = {};
      
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (country !== undefined) updateData.country = country;
      if (language !== undefined) updateData.language = language;
      if (age !== undefined) updateData.age = age;
      if (gender !== undefined) updateData.gender = gender;
      if (weightKg !== undefined) updateData.weightKg = weightKg;
      if (heightCm !== undefined) updateData.heightCm = heightCm;
      if (dailyCalorieGoal !== undefined) updateData.dailyCalorieGoal = dailyCalorieGoal;
      if (preferences !== undefined) updateData.preferences = preferences;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'User updated successfully',
        user: {
          _id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          country: updatedUser.country,
          language: updatedUser.language,
          preferences: updatedUser.preferences,
          age: updatedUser.age,
          gender: updatedUser.gender,
          weightKg: updatedUser.weightKg,
          heightCm: updatedUser.heightCm,
          dailyCalorieGoal: updatedUser.dailyCalorieGoal,
        }
      });
    } else if (req.method === 'DELETE') {
      // Delete user
      const deletedUser = await User.findByIdAndDelete(id);
      
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'User deleted successfully',
        deletedUser: {
          _id: deletedUser._id,
          email: deletedUser.email,
          firstName: deletedUser.firstName,
          lastName: deletedUser.lastName,
        }
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User management error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
