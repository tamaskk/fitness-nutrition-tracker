import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Initialize OpenAI only if API key is available
let openai: any = null;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // Check if OpenAI is configured
    if (!openai) {
      return res.status(503).json({ 
        message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
      });
    }

    // Analyze the bill image with GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt/bill image and extract the following information in JSON format:
              {
                "totalAmount": number,
                "merchant": string,
                "date": string (YYYY-MM-DD format),
                "items": [
                  {
                    "name": string,
                    "price": number,
                    "quantity": number
                  }
                ],
                "currency": string,
                "confidence": number (0-1)
              }
              
              Please be as accurate as possible. If you cannot determine a value, use null. The currency should be in the format like "HUF", "EUR", "USD". The confidence should reflect how certain you are about the extraction accuracy.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    });

    const analysisResult = response.choices[0]?.message?.content;
    
    if (!analysisResult) {
      return res.status(500).json({ message: 'Failed to analyze image' });
    }

    // Parse the JSON response
    let parsedResult;
    try {
      // Extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        parsedResult = JSON.parse(analysisResult);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ message: 'Failed to parse analysis result' });
    }

    // Validate and clean the result
    const cleanedResult = {
      totalAmount: parsedResult.totalAmount || 0,
      merchant: parsedResult.merchant || 'Ismeretlen',
      date: parsedResult.date || new Date().toISOString().split('T')[0],
      items: Array.isArray(parsedResult.items) ? parsedResult.items.map((item: any) => ({
        name: item.name || 'Ismeretlen tétel',
        price: item.price || 0,
        quantity: item.quantity || 1
      })) : [],
      currency: parsedResult.currency || 'HUF',
      confidence: Math.min(Math.max(parsedResult.confidence || 0.5, 0), 1)
    };

    res.status(200).json({
      success: true,
      analysis: cleanedResult
    });

  } catch (error) {
    console.error('Bill analysis error:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(500).json({ message: 'OpenAI API key not configured' });
      }
      if (error.message.includes('quota')) {
        return res.status(429).json({ message: 'OpenAI API quota exceeded' });
      }
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
}
