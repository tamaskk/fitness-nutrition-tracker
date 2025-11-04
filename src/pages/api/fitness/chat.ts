import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserFromToken } from '@/utils/auth';
import OpenAI from 'openai';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 30000, // 30 seconds
});

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check for JWT token first (for mobile app), then NextAuth session (for web app)
  const tokenUser = getUserFromToken(req);
  const session = await getServerSession(req, res, authOptions);
  
  const userEmail = tokenUser?.email || session?.user?.email || req.body.userEmail;
  
  if (!userEmail) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectToDatabase();

    const { message, conversationHistory } = req.body;

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
    const user = await User.findOne({ email: userEmail });
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

    // Call OpenAI
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
    const timestamp = new Date().toISOString();
    
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

