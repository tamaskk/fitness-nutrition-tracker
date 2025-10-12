import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import MealEntry from '@/models/MealEntry';
import WorkoutEntry from '@/models/WorkoutEntry';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if user is admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    await connectToDatabase();

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get new users this month
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Get all users with basic info
    const users = await User.find({}, {
      email: 1,
      firstName: 1,
      lastName: 1,
      country: 1,
      language: 1,
      preferences: 1,
      onboardingAnswers: 1,
      birthday: 1,
      gender: 1,
      weight: 1,
      height: 1,
      dailyCalorieGoal: 1,
      createdAt: 1
    }).sort({ createdAt: -1 });

    // Calculate gender distribution
    const genderDistribution = {
      male: users.filter(user => user.gender === 'male').length,
      female: users.filter(user => user.gender === 'female').length,
      other: users.filter(user => user.gender === 'other').length,
    };

    // Calculate average age from birthday
    const usersWithBirthday = users.filter(user => user.birthday);
    const currentYear = new Date().getFullYear();
    const averageAge = usersWithBirthday.length > 0 
      ? usersWithBirthday.reduce((sum, user) => {
          const birthYear = new Date(user.birthday).getFullYear();
          return sum + (currentYear - birthYear);
        }, 0) / usersWithBirthday.length 
      : undefined;

    // Get active users this week (users who logged meals or workouts)
    const activeUsersThisWeek = await User.distinct('userId', {
      $or: [
        { createdAt: { $gte: startOfWeek } },
        { 
          _id: { 
            $in: await MealEntry.distinct('userId', { 
              createdAt: { $gte: startOfWeek } 
            })
          }
        },
        { 
          _id: { 
            $in: await WorkoutEntry.distinct('userId', { 
              createdAt: { $gte: startOfWeek } 
            })
          }
        }
      ]
    }).length;

    const stats = {
      totalUsers,
      newUsersThisMonth,
      activeUsersThisWeek,
      averageAge: averageAge ? Math.round(averageAge) : undefined,
      genderDistribution,
      users: users.map(user => ({
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        language: user.language,
        preferences: user.preferences,
        onboardingAnswers: user.onboardingAnswers,
        birthday: user.birthday,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        dailyCalorieGoal: user.dailyCalorieGoal,
        createdAt: user.createdAt
      }))
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
