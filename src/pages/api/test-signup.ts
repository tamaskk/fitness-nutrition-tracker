import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, firstName, lastName, country, language } = req.body;

    console.log('Test signup data:', { email, firstName, lastName, country, language });

    if (!email || !password || !firstName || !lastName || !country || !language) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with all new fields
    const userData = {
      email,
      passwordHash,
      firstName,
      lastName,
      country,
      language,
      preferences: {
        mealPlans: false,
        recipes: false,
        trainings: false,
        shoppingList: false,
        priceMonitor: false,
        finance: false,
      },
      onboardingAnswers: {
        mealPlans: {},
        recipes: {},
        trainings: {},
        shoppingList: {},
        priceMonitor: {},
        finance: {},
      },
      dailyCalorieGoal: 2000,
    };

    console.log('Creating user with data:', userData);

    const user = await User.create(userData);

    console.log('User created:', user.toObject());

    res.status(201).json({
      message: 'User created successfully',
      user: user.toObject(),
    });
  } catch (error) {
    console.error('Test signup error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
