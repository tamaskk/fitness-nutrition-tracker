import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { foodName, quantity, unit, description } = req.body;

    if (!foodName || typeof foodName !== 'string') {
      return res.status(400).json({ message: 'Food name is required' });
    }

    // Check if we have OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      // Return mock estimation for development/demo
      const mockEstimations = {
        'chicken breast': {
          caloriesPer100g: 165,
          proteinPer100g: 31,
          carbsPer100g: 0,
          fatPer100g: 3.6,
          confidence: 0.9,
        },
        'brown rice': {
          caloriesPer100g: 111,
          proteinPer100g: 2.6,
          carbsPer100g: 23,
          fatPer100g: 0.9,
          confidence: 0.85,
        },
        'broccoli': {
          caloriesPer100g: 34,
          proteinPer100g: 2.8,
          carbsPer100g: 7,
          fatPer100g: 0.4,
          confidence: 0.88,
        },
        'banana': {
          caloriesPer100g: 89,
          proteinPer100g: 1.1,
          carbsPer100g: 23,
          fatPer100g: 0.3,
          confidence: 0.92,
        },
        'greek yogurt': {
          caloriesPer100g: 59,
          proteinPer100g: 10,
          carbsPer100g: 3.6,
          fatPer100g: 0.4,
          confidence: 0.87,
        }
      };

      // Find closest match or use default values
      const lowerFoodName = foodName.toLowerCase();
      let estimation = null;

      for (const [key, value] of Object.entries(mockEstimations)) {
        if (lowerFoodName.includes(key) || key.includes(lowerFoodName)) {
          estimation = value;
          break;
        }
      }

      if (!estimation) {
        // Default estimation for unknown foods
        estimation = {
          caloriesPer100g: 150,
          proteinPer100g: 8,
          carbsPer100g: 15,
          fatPer100g: 6,
          confidence: 0.3,
        };
      }

      // Calculate total nutrition based on quantity
      let totalNutrition = { ...estimation };
      if (quantity && typeof quantity === 'number') {
        const factor = quantity / 100; // Assuming base is per 100g
        if (unit === 'g' || unit === 'grams') {
          totalNutrition = {
            caloriesPer100g: Math.round(estimation.caloriesPer100g * factor),
            proteinPer100g: Math.round(estimation.proteinPer100g * factor * 10) / 10,
            carbsPer100g: Math.round(estimation.carbsPer100g * factor * 10) / 10,
            fatPer100g: Math.round(estimation.fatPer100g * factor * 10) / 10,
            confidence: estimation.confidence,
          };
        }
      }

      return res.status(200).json({
        success: true,
        estimation: {
          foodName,
          quantity,
          unit,
          nutrition: totalNutrition,
          notes: `Estimated nutrition values for ${foodName}. ${estimation.confidence < 0.5 ? 'Low confidence - please verify manually.' : 'Reasonably confident estimation.'}`,
          method: 'mock_estimation',
        },
      });
    }

    // Real OpenAI API integration
    try {
      const prompt = `Estimate the nutritional information for the following food item:

Food: ${foodName}
${quantity ? `Quantity: ${quantity} ${unit || 'grams'}` : ''}
${description ? `Description: ${description}` : ''}

Please provide accurate nutritional estimates per 100g and total values if quantity is specified. Return a JSON response with:
- caloriesPer100g: calories per 100 grams
- proteinPer100g: protein in grams per 100g
- carbsPer100g: carbohydrates in grams per 100g  
- fatPer100g: fat in grams per 100g
- totalCalories: total calories for the specified quantity (if provided)
- totalProtein: total protein for the specified quantity (if provided)
- totalCarbs: total carbs for the specified quantity (if provided)
- totalFat: total fat for the specified quantity (if provided)
- confidence: confidence level from 0 to 1
- notes: any relevant notes about the estimation

Base your estimates on standard nutritional databases and be as accurate as possible.`;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition expert with access to comprehensive food databases. Provide accurate nutritional estimates and always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.1, // Low temperature for consistent, factual responses
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const responseText = openaiData.choices[0]?.message?.content;

      if (!responseText) {
        throw new Error('No response received from OpenAI');
      }

      // Try to parse JSON from the response
      let nutritionData;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          nutritionData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // If JSON parsing fails, extract key values from text
        const extractNumber = (text: string, pattern: RegExp) => {
          const match = text.match(pattern);
          return match ? parseFloat(match[1]) : 0;
        };

        nutritionData = {
          caloriesPer100g: extractNumber(responseText, /calories?[:\s]+(\d+\.?\d*)/i) || 150,
          proteinPer100g: extractNumber(responseText, /protein[:\s]+(\d+\.?\d*)/i) || 8,
          carbsPer100g: extractNumber(responseText, /carb[s\w]*[:\s]+(\d+\.?\d*)/i) || 15,
          fatPer100g: extractNumber(responseText, /fat[:\s]+(\d+\.?\d*)/i) || 6,
          confidence: 0.7,
          notes: 'Estimated from AI analysis',
        };
      }

      return res.status(200).json({
        success: true,
        estimation: {
          foodName,
          quantity,
          unit,
          nutrition: nutritionData,
          notes: nutritionData.notes || `AI-estimated nutrition values for ${foodName}`,
          method: 'openai_estimation',
        },
      });

    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      
      // Fallback to basic estimation if API fails
      return res.status(200).json({
        success: true,
        estimation: {
          foodName,
          quantity,
          unit,
          nutrition: {
            caloriesPer100g: 150,
            proteinPer100g: 8,
            carbsPer100g: 15,
            fatPer100g: 6,
            confidence: 0.3,
          },
          notes: 'AI estimation unavailable. Using default values - please verify manually.',
          method: 'fallback',
          error: 'AI estimation service unavailable',
        },
      });
    }

  } catch (error) {
    console.error('Nutrition estimation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
