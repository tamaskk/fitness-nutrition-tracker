import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserFromToken } from '@/utils/auth';
import OpenAI from 'openai';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { ExerciseDocument } from '@/models/Exercise';
import { Types } from 'mongoose';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 30000, // 30 seconds
});

// ExerciseDB API Response Type
interface ExerciseDBExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

const CLASSIFICATION_PROMPT = `
You are a message classifier for a fitness app. Analyze the user's message and categorize it into ONE of these categories:

Categories:
1. "training" - ONLY when user wants to CREATE, GET, or VIEW a workout plan/routine/program. Examples: "create a workout", "give me a training plan", "what exercises should I do", "show me a workout routine"
2. "recipe" - ONLY when user wants to GET, MAKE, or COOK a specific recipe. Examples: "how to cook chicken", "give me a recipe for", "how do I make", "cooking instructions"
3. "finance" - ONLY when user wants to TRACK, VIEW, or MANAGE money/expenses. Examples: "track my expenses", "how much did I spend", "budget", "add expense"
4. "shopping_list" - ONLY when user wants to CREATE, VIEW, or MANAGE a shopping list. Examples: "add to shopping list", "what should I buy", "create shopping list", "show my list"
5. "general" - Everything else: advice questions, explanations, recommendations, how-to questions, nutrition advice, motivation, greetings, rest/recovery advice, general fitness guidance

Important distinctions:
- "Create a workout plan" → training (wants a plan)
- "What rest days do you recommend?" → general (asking for advice)
- "How often should I train?" → general (asking for guidance)
- "Should I do cardio or weights?" → general (asking for recommendation)
- "Give me a recipe" → recipe (wants recipe)
- "What should I eat for protein?" → general (nutrition advice, not recipe)
- "How to cook salmon?" → recipe (wants cooking instructions)
- "Is salmon good for protein?" → general (nutrition question)

Examples:
- "I want to build muscle" → general (advice request)
- "Create a muscle building workout plan" → training (wants plan)
- "How do I make chicken breast?" → recipe
- "What's a good protein recipe?" → recipe
- "Track my expenses" → finance
- "What should I buy for meal prep?" → shopping_list
- "How many calories should I eat?" → general
- "I need motivation to lose weight" → general
- "Hello, how are you?" → general
- "What rest days do you recommend?" → general
- "Milyen pihenőnapokat javasolsz?" → general (Hungarian: rest day advice)
- "Should I rest after leg day?" → general
- "Give me a 5-day workout split" → training (wants plan)

Output ONLY the category name, nothing else: training, recipe, finance, shopping_list, or general
`;

const SYSTEM_PROMPT = `
You are FitPro, an expert fitness and nutrition coach with over 15 years of experience.

Your role:
- Provide personalized fitness advice, workout recommendations, and nutrition guidance
- Answer questions about exercise techniques, diet planning, weight loss/gain strategies
- Motivate and encourage users on their fitness journey
- Give evidence-based advice backed by sports science
- Help users set realistic fitness goals and create actionable plans

Your personality:
- Friendly, supportive, and motivational
- Professional but approachable
- Encouraging without being pushy
- Use simple language that anyone can understand
- Provide specific, actionable advice rather than generic tips

Guidelines:
- Always prioritize safety and recommend consulting healthcare professionals for medical concerns
- Tailor advice based on user's fitness level, goals, and constraints
- Ask clarifying questions when needed to provide better advice
- Break down complex topics into easy-to-understand steps
- Celebrate user progress and milestones
- Be honest about realistic timelines and expectations

Topics you excel at:
- Workout programming (strength training, cardio, flexibility)
- Nutrition and meal planning
- Weight loss/gain strategies
- Muscle building and body composition
- Exercise form and technique
- Recovery and injury prevention
- Motivation and mindset
- Supplements and hydration
- Sleep and stress management

Keep responses concise but informative (2-4 paragraphs typically).
Use bullet points for lists and step-by-step instructions.
End with an encouraging note or question to keep the conversation going.
`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

// Helper function to extract training details from conversation
function extractTrainingDetails(message: string, history: Message[]): {
  hasMuscleGroup: boolean;
  hasExerciseNumber: boolean;
  hasOtherDetails: boolean;
  muscleGroups: string[];
  exerciseCount: number;
} {
  const recentMessages = history.slice(-6).map(m => m.content).join(' ').toLowerCase() + ' ' + message.toLowerCase();
  
  // Check for muscle groups
  const muscleKeywords = [
    'chest', 'back', 'legs', 'shoulders', 'arms', 'biceps', 'triceps', 
    'abs', 'core', 'glutes', 'quads', 'hamstrings', 'calves',
    'full body', 'upper body', 'lower body', 'push', 'pull',
    'mellkas', 'hát', 'láb', 'váll', 'kar', 'has', 'far', 'teljes test'
  ];
  const hasMuscleGroup = muscleKeywords.some(keyword => recentMessages.includes(keyword));
  
  // Extract specific muscle groups from conversation
  const muscleGroups: string[] = [];
  const muscleMapping: { [key: string]: string } = {
    'chest': 'chest',
    'mellkas': 'chest',
    'mell': 'chest',
    'back': 'back',
    'hát': 'back',
    'hat': 'back',
    'legs': 'legs',
    'láb': 'legs',
    'lab': 'legs',
    'shoulders': 'shoulders',
    'váll': 'shoulders',
    'vall': 'shoulders',
    'arms': 'arms',
    'kar': 'arms',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'tricepsz': 'triceps',
    'abs': 'core',
    'has': 'core',
    'core': 'core',
    'glutes': 'glutes',
    'far': 'glutes',
    'full body': 'full-body',
    'teljes test': 'full-body',
  };
  
  for (const [keyword, mapped] of Object.entries(muscleMapping)) {
    if (recentMessages.includes(keyword) && !muscleGroups.includes(mapped)) {
      muscleGroups.push(mapped);
    }
  }
  
  // Check for exercise number - also check the current message alone for standalone numbers
  const currentMessageLower = message.toLowerCase().trim();
  const isStandaloneNumber = /^\d+$/.test(currentMessageLower);
  
  const exerciseNumberPatterns = [
    /(\d+)\s*(exercises?|gyakorlat|упражнения)/i,
    /(\d+)\s*per\s*muscle/i,
    /(three|four|five|six|seven|eight|három|négy|öt|hat|hét|nyolc)\s*(exercises?|gyakorlat)/i,
  ];
  
  const hasExerciseNumber = isStandaloneNumber || exerciseNumberPatterns.some(pattern => pattern.test(recentMessages));
  
  // Extract exercise count
  let exerciseCount = 0;
  
  // First, check if current message is just a number
  if (isStandaloneNumber) {
    exerciseCount = parseInt(currentMessageLower);
  } else {
    // Otherwise, check patterns in conversation
    for (const pattern of exerciseNumberPatterns) {
      const match = recentMessages.match(pattern);
      if (match) {
        const numMap: { [key: string]: number } = {
          'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8,
          'három': 3, 'négy': 4, 'öt': 5, 'hat': 6, 'hét': 7, 'nyolc': 8
        };
        exerciseCount = parseInt(match[1]) || numMap[match[1].toLowerCase()] || 0;
        break;
      }
    }
  }
  
  // Check for other useful details (frequency, level, equipment)
  const frequencyKeywords = ['day', 'week', 'times', 'nap', 'hét', 'alkalom'];
  const levelKeywords = ['beginner', 'intermediate', 'advanced', 'kezdő', 'haladó', 'középhaladó'];
  const equipmentKeywords = ['gym', 'home', 'dumbbell', 'bodyweight', 'edzőterem', 'otthon'];
  
  const hasOtherDetails = 
    frequencyKeywords.some(k => recentMessages.includes(k)) ||
    levelKeywords.some(k => recentMessages.includes(k)) ||
    equipmentKeywords.some(k => recentMessages.includes(k));
  
  return { hasMuscleGroup, hasExerciseNumber, hasOtherDetails, muscleGroups, exerciseCount };
}

// Helper function to generate workout plan from ExerciseDB API
async function generateWorkoutPlan(muscleGroups: string[], exercisesPerMuscle: number) {
  const workoutPlan: any = {
    muscleGroups: [],
    exercises: [],
    totalExercises: 0,
  };

  console.log('muscleGroups', muscleGroups);

  for (const muscleGroup of muscleGroups) {
    console.log('muscleGroup', muscleGroup);
    try {
      // Map muscle group to ExerciseDB parameter
      const url = `https://www.exercisedb.dev/api/v1/muscles/${muscleGroup}/exercises?offset=0&limit=100&includeSecondary=false`;
      console.log('url', url);
      // Fetch exercises from ExerciseDB API
      const response = await fetch(url);

      if (!response.ok) {
        console.log(`Failed to fetch exercises for ${muscleGroup}: ${response.status}`);
        continue;
      }

      const responseData = await response.json();

      // Randomly select N unique exercises
      const count = Math.min(exercisesPerMuscle, responseData.data.length);
      console.log('count', count);

      // Create an array of indexes, shuffle, and take first count
      const indices = Array.from({ length: responseData.data.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const selectedIndices = indices.slice(0, count);

      selectedIndices.forEach(idx => {
        const exercise = responseData.data[idx];
        workoutPlan.exercises.push(exercise);
      });

    } catch (error) {
      console.error(`Error fetching exercises for ${muscleGroup}:`, error);
    }
  }

  console.log('workoutPlan', JSON.stringify(workoutPlan, null, 2));
  return workoutPlan;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check for JWT token first (for mobile app), then NextAuth session (for web app)
  // const tokenUser = getUserFromToken(req);
  // const session = await getServerSession(req, res, authOptions);
  
  // const userEmail = tokenUser?.email || session?.user?.email || req.body.userEmail;
  
  // if (!userEmail) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  try {
    await connectToDatabase();

    const { message, conversationHistory } = req.body;

    console.log('message', message);
    console.log('conversationHistory length:', conversationHistory?.length || 0);
    if (conversationHistory && conversationHistory.length > 0) {
      console.log('Last message in history:', conversationHistory[conversationHistory.length - 1]);
    }

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a message' 
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({ 
        success: false,
        message: 'Message is too long. Please keep it under 1000 characters.' 
      });
    }

    // Validate conversation history
    let history: Message[] = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Limit conversation history to last 20 messages to avoid token limits
      history = conversationHistory.slice(-20).filter((msg: any) => 
        msg && 
        typeof msg === 'object' && 
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string'
      );
    }

    // Get user profile for context
    const user = await User.findOne({ email: 'tamas+28@blcks.io' });
    let userContext = '';
    
    if (user) {
      const age = user.birthday ? Math.floor((Date.now() - new Date(user.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
      userContext = `\n\nUser Profile Context (use this to personalize advice):
- Name: ${user.firstName}
- Age: ${age || 'Unknown'}
- Gender: ${user.gender || 'Not specified'}
- Current Weight: ${user.weight?.value || 'Unknown'} ${user.weight?.unit || 'kg'}
- Height: ${user.height?.value || 'Unknown'} ${user.height?.unit || 'cm'}
- Daily Calorie Goal: ${user.dailyCalorieGoal || 'Not set'}
- Fitness Goal: ${user.goal?.goalType || 'Not specified'}
${user.goal?.plan?.targetWeightKg ? `- Target Weight: ${user.goal.plan.targetWeightKg} kg` : ''}

Use this information to provide personalized advice, but don't repeat it back to the user.`;
    }

    // Build messages array for OpenAI
    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT + userContext }
    ];

    // Add conversation history
    history.forEach((msg: Message) => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    console.log('Fitness chat - processing message:', message.substring(0, 50) + '...');

    const timestamp = new Date().toISOString();

    // STEP 1: Check if we're in the middle of a training flow
    // Find the last assistant message (search backwards)
    let lastAssistantMessage = null;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'assistant') {
        lastAssistantMessage = history[i];
        break;
      }
    }
    
    console.log('Last assistant message:', lastAssistantMessage);
    
    // Check for training flow - support both marker content and display text
    const isInTrainingFlow = lastAssistantMessage && 
                            (lastAssistantMessage.content === 'muscleGroup' || 
                             lastAssistantMessage.content === 'exerciseNumber' ||
                             lastAssistantMessage.content.includes('Which muscle groups') ||
                             lastAssistantMessage.content.includes('How many exercises'));

    console.log('Is in training flow?', isInTrainingFlow);

    let category = 'general';

    // If we're in training flow, treat this message as part of training
    if (isInTrainingFlow) {
      category = 'training';
      console.log('Continuing training flow...');
    } else {
      // STEP 2: Classify the message
      console.log('Classifying message...');
      const classificationCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 20,
        messages: [
          { role: 'system', content: CLASSIFICATION_PROMPT },
          { role: 'user', content: message }
        ],
      });

      category = classificationCompletion.choices[0].message?.content?.trim().toLowerCase() || 'general';
      console.log('Message classified as:', category);
    }

    // STEP 3: Special handling for training - structured step-by-step flow
    if (category === 'training') {
      const details = extractTrainingDetails(message, history);
      console.log('Training details:', {
        hasMuscleGroup: details.hasMuscleGroup,
        hasExerciseNumber: details.hasExerciseNumber,
        muscleGroups: details.muscleGroups,
        exerciseCount: details.exerciseCount,
        message: message
      });
      
      // STEP 2a: First, ask for muscle groups if not provided
      if (!details.hasMuscleGroup) {
        console.log('Asking for muscle groups...');
        
        const updatedHistory: Message[] = [
          ...history,
          {
            role: 'user',
            content: message,
            timestamp: timestamp
          },
          {
            role: 'assistant',
            content: 'muscleGroup',
            timestamp: timestamp
          }
        ];

        const returnData = {
          success: true,
          category: 'general',
          responseType: 'muscleGroup',
          needsMoreInfo: true,
          pendingCategory: 'training',
          response: "Which muscle groups do you want to focus on? Select one or more:",
          conversationHistory: updatedHistory,
          timestamp: timestamp,
          messageCount: updatedHistory.length
        };

        console.log('returnData', returnData);

        return res.status(200).json(returnData);
      }
      
      // STEP 2b: Then, ask for exercise number if not provided
      if (!details.hasExerciseNumber) {
        console.log('Asking for exercise number...');
        
        const updatedHistory: Message[] = [
          ...history,
          {
            role: 'user',
            content: message,
            timestamp: timestamp
          },
          {
            role: 'assistant',
            content: 'exerciseNumber',
            timestamp: timestamp
          }
        ];

        const returnData = {
          success: true,
          category: 'general',
          responseType: 'exerciseNumber',
          needsMoreInfo: true,
          pendingCategory: 'training',
          response: "How many exercises per muscle group would you like?",
          conversationHistory: updatedHistory,
          timestamp: timestamp,
          messageCount: updatedHistory.length
        };

        return res.status(200).json(returnData);
      }
      
      // STEP 2c: Has muscle group AND exercise number - generate workout plan!
      // Generate workout plan from database
      const workoutPlan = await generateWorkoutPlan(
        details.muscleGroups.length > 0 ? details.muscleGroups : ['chest', 'back', 'legs'], // Default if none detected
        details.exerciseCount || 3 // Default to 3 if none detected
      );
      
      const updatedHistory: Message[] = [
        ...history,
        {
          role: 'user',
          content: message,
          timestamp: timestamp
        },
        {
          role: 'assistant',
          content: category,
          timestamp: timestamp
        }
      ];

      const returnData = {
        success: true,
        category: 'training',
        response: 'I have generated a workout plan for you. Here it is:',
        responseType: 'workoutPlan',
        workoutPlan: workoutPlan, // Include the generated workout plan
        conversationHistory: updatedHistory,
        timestamp: timestamp,
        messageCount: updatedHistory.length
      };

      return res.status(200).json(returnData);
    }

    // STEP 4: For other specific categories (recipe, finance, shopping_list), return immediately
    if (category === 'recipe' || category === 'finance' || category === 'shopping_list') {
      const updatedHistory: Message[] = [
        ...history,
        {
          role: 'user',
          content: message,
          timestamp: timestamp
        },
        {
          role: 'assistant',
          content: category,
          timestamp: timestamp
        }
      ];

      return res.status(200).json({
        success: true,
        category: category,
        response: category,
        conversationHistory: updatedHistory,
        timestamp: timestamp,
        messageCount: updatedHistory.length
      });
    }

    // STEP 5: If it's general, provide full AI response
    console.log('Generating detailed response for general question...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 800,
      messages: messages,
    });

    const assistantResponse = completion.choices[0].message?.content;
    
    if (!assistantResponse) {
      throw new Error('No response from AI');
    }

    console.log('Fitness chat - response generated');

    // Build updated conversation history
    const updatedHistory: Message[] = [
      ...history,
      {
        role: 'user',
        content: message,
        timestamp: timestamp
      },
      {
        role: 'assistant',
        content: assistantResponse,
        timestamp: timestamp
      }
    ];

    // Return response with updated conversation
    res.status(200).json({
      success: true,
      category: 'general',
      response: assistantResponse,
      conversationHistory: updatedHistory,
      timestamp: timestamp,
      messageCount: updatedHistory.length
    });

  } catch (error) {
    console.error('Fitness chat error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for timeout
    if (errorMessage.includes('timed out') || errorMessage.includes('timeout')) {
      return res.status(504).json({ 
        success: false,
        message: 'Request timed out. Please try again.',
      });
    }

    // Check for rate limit or API errors
    if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      return res.status(429).json({ 
        success: false,
        message: 'Too many requests. Please try again in a moment.',
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to process your message',
      error: errorMessage 
    });
  }
}

