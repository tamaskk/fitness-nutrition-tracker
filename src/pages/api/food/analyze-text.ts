import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserFromToken } from '@/utils/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 30000, // 30 seconds
});

const SYSTEM_PROMPT = `
You are a professional nutritionist AI assistant.
Your task is to analyze food descriptions provided by users and estimate the nutritional content as accurately as possible.

When a user provides a food description (e.g., "2 slices of pizza and a coke", "chicken breast with rice", "banana"), you must:

1. Identify all food items mentioned
2. Estimate reasonable portion sizes if not specified
3. Calculate the total nutritional content

You must return ONLY valid JSON in this exact format:

{
  "success": true,
  "analysis": {
    "description": "Brief summary of what was analyzed",
    "items": [
      {
        "name": "Food item name",
        "quantity": "Estimated quantity (e.g., '2 slices', '150g', '1 medium')",
        "calories": number,
        "macros": {
          "protein": number (in grams),
          "carbs": number (in grams),
          "fat": number (in grams),
          "fiber": number (in grams)
        },
        "micros": {
          "vitaminA": number (in mcg),
          "vitaminC": number (in mg),
          "vitaminD": number (in mcg),
          "calcium": number (in mg),
          "iron": number (in mg),
          "sodium": number (in mg),
          "potassium": number (in mg)
        }
      }
    ],
    "totals": {
      "calories": number,
      "macros": {
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number
      },
      "micros": {
        "vitaminA": number,
        "vitaminC": number,
        "vitaminD": number,
        "calcium": number,
        "iron": number,
        "sodium": number,
        "potassium": number
      }
    },
    "notes": [
      "Additional notes or warnings (e.g., 'High in sodium', 'Good source of protein')"
    ]
  }
}

Rules:
- Be realistic with estimates
- If the description is vague, make reasonable assumptions about portion sizes
- Include all micronutrients even if they are 0
- Round numbers to 1 decimal place
- If you cannot identify the food, return success: false with an error message
- Always return valid JSON only, no explanations outside the JSON
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check for JWT token first (for mobile app), then NextAuth session (for web app)
  const tokenUser = getUserFromToken(req);
  const session = await getServerSession(req, res, authOptions);
  
  const userEmail = tokenUser?.email || session?.user?.email;
  
  if (!userEmail) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Please provide a food description text',
        success: false 
      });
    }

    if (text.length > 500) {
      return res.status(400).json({ 
        message: 'Text description is too long. Please keep it under 500 characters.',
        success: false 
      });
    }

    console.log('Analyzing food text:', text);

    // Call OpenAI to analyze the food text
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3, // Lower temperature for more consistent estimates
      max_tokens: 1500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this food description and provide detailed nutritional information: "${text}"`
        },
      ],
    });

    const result = completion.choices[0].message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    console.log('AI analysis result:', result);

    // Parse the JSON response
    const parsedResult = JSON.parse(result);

    if (!parsedResult.success) {
      return res.status(400).json({
        success: false,
        message: parsedResult.message || 'Could not analyze the food description',
      });
    }

    // Return the analysis
    res.status(200).json({
      success: true,
      analysis: parsedResult.analysis,
      originalText: text,
      analyzedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Food text analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for OpenAI-specific errors
    if (errorMessage.includes('timed out') || errorMessage.includes('timeout')) {
      return res.status(504).json({ 
        success: false,
        message: 'Analysis timed out. Please try again.',
      });
    }

    if (errorMessage.includes('JSON')) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to parse AI response. Please try again.',
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to analyze food text',
      error: errorMessage 
    });
  }
}

