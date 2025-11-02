import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      country, 
      language, 
      birthday, 
      gender, 
      weight, 
      height,
      dailyCalorieGoal,
      preferences,
      onboardingAnswers
    } = req.body;

    console.log('Signup API received data:', req.body);

    console.log('STRINGIFIED:', JSON.stringify(req.body));

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
      console.log('1');
      return res.status(400).json({ message: 'All required fields are required' });
    }

    if (password.length < 6) {
      console.log('2');
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('3');
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with all provided data
    const userData: any = {
      email,
      passwordHash,
      firstName,
      lastName,
      country,
      language,
      birthday: new Date(birthday),
      dailyCalorieGoal: dailyCalorieGoal || 2000,
    };

    // Add optional fields if provided
    if (gender) {
      userData.gender = gender;
    }

    if (weight) {
      userData.weight = {
        value: weight.value,
        unit: weight.unit || 'kg'
      };
    }

    if (height) {
      userData.height = {
        value: height.value,
        unit: height.unit || 'cm'
      };
    }

    // Save user preferences (merge with defaults)
    userData.preferences = {
      mealPlans: preferences?.mealPlans ?? false,
      recipes: preferences?.recipes ?? false,
      trainings: preferences?.trainings ?? false,
      shoppingList: preferences?.shoppingList ?? false,
      priceMonitor: preferences?.priceMonitor ?? false,
      finance: preferences?.finance ?? false,
      marketing: preferences?.marketing ?? false,
      tips: preferences?.tips ?? true,
      updates: preferences?.updates ?? true,
    };

    // Save onboarding answers - direct array format
    if (onboardingAnswers) {
      // Check if it's already a direct array or nested in questionnaire
      if (Array.isArray(onboardingAnswers)) {
        userData.onboardingAnswers = onboardingAnswers;
        if (onboardingAnswers.length > 0) {
          userData.onboardingCompletedAt = new Date();
        }
      } else if (onboardingAnswers.questionnaire && Array.isArray(onboardingAnswers.questionnaire)) {
        userData.onboardingAnswers = onboardingAnswers.questionnaire;
        if (onboardingAnswers.questionnaire.length > 0) {
          userData.onboardingCompletedAt = new Date();
        }
      } else {
        userData.onboardingAnswers = [];
      }
    } else {
      // Fallback to empty array
      userData.onboardingAnswers = [];
    }

    console.log('Creating user with data:', userData);
    const user = await User.create(userData);
    console.log('User created successfully:', user._id);

    // Generate JWT token (auto-login after signup)
    const token = jwt.sign(
      {
        userId: (user as any)._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      {
        expiresIn: '7d', // Token expires in 7 days
      }
    );

    console.log('User registered and logged in automatically');

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        language: user.language,
        preferences: user.preferences,
        birthday: user.birthday,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        dailyCalorieGoal: user.dailyCalorieGoal,
        onboardingAnswers: user.onboardingAnswers,
        onboardingCompletedAt: (user as any).onboardingCompletedAt,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

