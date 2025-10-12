import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, firstName, lastName, country, language, birthday, gender, weight, height } = req.body;

    console.log('Signup API received data:', { email, firstName, lastName, country, language, birthday, gender, weight, height });

    if (!email || !password || !firstName || !lastName || !country || !language || !birthday) {
      console.log('Missing required fields:', { 
        hasEmail: !!email, 
        hasPassword: !!password, 
        hasFirstName: !!firstName, 
        hasLastName: !!lastName, 
        hasCountry: !!country, 
        hasLanguage: !!language,
        hasBirthday: !!birthday
      });
      return res.status(400).json({ message: 'All required fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with default preferences
    const userData = {
      email,
      passwordHash,
      firstName,
      lastName,
      country,
      language,
      ...(birthday && { birthday: new Date(birthday) }),
      ...(gender && { gender }),
      ...(weight && { weight }),
      ...(height && { height }),
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
      dailyCalorieGoal: 2000, // Default calorie goal
    };

    console.log('Creating user with data:', userData);
    const user = await User.create(userData);
    console.log('User created successfully:', user.toObject());

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

