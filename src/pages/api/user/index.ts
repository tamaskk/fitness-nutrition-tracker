import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Get user data
      const user = await User.findOne({ email: session.user.email });
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
          birthday: user.birthday,
          gender: user.gender,
          weight: user.weight,
          height: user.height,
          dailyCalorieGoal: user.dailyCalorieGoal,
          preferences: user.preferences,
          onboardingAnswers: user.onboardingAnswers,
          createdAt: user.createdAt,
        }
      });
    } else if (req.method === 'PUT') {
      // Update user data
      const {
        firstName,
        lastName,
        email,
        country,
        language,
        birthday,
        gender,
        weight,
        height,
        dailyCalorieGoal,
      } = req.body;

      const updateData: any = {};
      
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (country !== undefined) updateData.country = country;
      if (language !== undefined) updateData.language = language;
      if (birthday !== undefined) updateData.birthday = new Date(birthday);
      if (gender !== undefined) updateData.gender = gender;
      if (weight !== undefined) updateData.weight = weight;
      if (height !== undefined) updateData.height = height;
      if (dailyCalorieGoal !== undefined) updateData.dailyCalorieGoal = dailyCalorieGoal;

      const updatedUser = await User.findOneAndUpdate(
        { email: session.user.email },
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
          birthday: updatedUser.birthday,
          gender: updatedUser.gender,
          weight: updatedUser.weight,
          height: updatedUser.height,
          dailyCalorieGoal: updatedUser.dailyCalorieGoal,
          preferences: updatedUser.preferences,
          onboardingAnswers: updatedUser.onboardingAnswers,
        }
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}