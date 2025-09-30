import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Configure for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { image, imageUrl } = req.body;

    if (!image && !imageUrl) {
      return res.status(400).json({ message: 'Image data or URL is required' });
    }

    // Check if we have OpenAI API key for vision
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      // Return mock analysis for development/demo
      const mockAnalyses = [
        {
          foodItems: [
            {
              name: 'Grilled Chicken Breast',
              estimatedGrams: 150,
              calories: 248,
              protein: 46.2,
              carbs: 0,
              fat: 5.4,
              confidence: 0.85,
            },
            {
              name: 'Steamed Broccoli',
              estimatedGrams: 100,
              calories: 34,
              protein: 2.8,
              carbs: 7,
              fat: 0.4,
              confidence: 0.78,
            },
            {
              name: 'Brown Rice',
              estimatedGrams: 80,
              calories: 89,
              protein: 2.1,
              carbs: 18.4,
              fat: 0.7,
              confidence: 0.72,
            }
          ],
          totalCalories: 371,
          analysisNotes: 'Detected a balanced meal with protein, vegetables, and carbohydrates. Portions appear to be moderate to large.',
          confidence: 0.78,
        },
        {
          foodItems: [
            {
              name: 'Caesar Salad',
              estimatedGrams: 200,
              calories: 180,
              protein: 8,
              carbs: 12,
              fat: 12,
              confidence: 0.82,
            },
            {
              name: 'Grilled Salmon',
              estimatedGrams: 120,
              calories: 250,
              protein: 35,
              carbs: 0,
              fat: 11,
              confidence: 0.88,
            }
          ],
          totalCalories: 430,
          analysisNotes: 'Healthy meal with lean protein and mixed greens. Good balance of nutrients.',
          confidence: 0.85,
        },
        {
          foodItems: [
            {
              name: 'Pepperoni Pizza Slice',
              estimatedGrams: 125,
              calories: 298,
              protein: 13,
              carbs: 36,
              fat: 12,
              confidence: 0.91,
            }
          ],
          totalCalories: 298,
          analysisNotes: 'Single slice of pepperoni pizza. High in calories and carbohydrates.',
          confidence: 0.91,
        }
      ];

      // Return a random mock analysis
      const randomAnalysis = mockAnalyses[Math.floor(Math.random() * mockAnalyses.length)];
      
      return res.status(200).json({
        success: true,
        analysis: randomAnalysis,
        method: 'mock_analysis',
      });
    }

    // Real OpenAI Vision API integration
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this food image and provide detailed nutrition information. Return a JSON response with:
                  - foodItems: array of identified foods with name, estimatedGrams, calories, protein, carbs, fat, confidence (0-1)
                  - totalCalories: sum of all food calories
                  - analysisNotes: brief description of the meal
                  - confidence: overall confidence in the analysis (0-1)
                  
                  Be as accurate as possible with portion sizes and nutritional values. If you can't identify something clearly, indicate lower confidence.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl || `data:image/jpeg;base64,${image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const analysisText = openaiData.choices[0]?.message?.content;

      if (!analysisText) {
        throw new Error('No analysis received from OpenAI');
      }

      // Try to parse JSON from the response
      let analysis;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the text
        analysis = {
          foodItems: [{
            name: 'Unknown Food Item',
            estimatedGrams: 100,
            calories: 200,
            protein: 10,
            carbs: 20,
            fat: 8,
            confidence: 0.5,
          }],
          totalCalories: 200,
          analysisNotes: analysisText.substring(0, 200) + '...',
          confidence: 0.5,
        };
      }

      return res.status(200).json({
        success: true,
        analysis,
        method: 'openai_vision',
      });

    } catch (apiError) {
      console.error('OpenAI Vision API error:', apiError);
      
      // Fallback to mock analysis if API fails
      return res.status(200).json({
        success: true,
        analysis: {
          foodItems: [{
            name: 'Food Item (Analysis Failed)',
            estimatedGrams: 100,
            calories: 200,
            protein: 10,
            carbs: 20,
            fat: 8,
            confidence: 0.3,
          }],
          totalCalories: 200,
          analysisNotes: 'Unable to analyze image with AI. Please manually enter food information.',
          confidence: 0.3,
        },
        method: 'fallback',
        error: 'AI analysis unavailable',
      });
    }

  } catch (error) {
    console.error('Image recognition error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

