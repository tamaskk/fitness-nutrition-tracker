import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";
import { IncomingForm } from 'formidable';
import fs from 'fs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeBillImage(imagePath: string) {
  try {
    // Read the image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg'; // Assuming JPEG, could be made dynamic

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a receipt OCR and parser. Extract structured data from Hungarian receipts. Return JSON with the exact structure specified.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this receipt image and return JSON with fields:
              {
                merchant: string,
                date: string | null,
                currency: "HUF",
                items: [
                  { name: string, price: number, quantity: number | string }
                ],
                totalAmount: number,
                confidence: number
              }
              
              Important rules:
              - Extract the total amount from lines containing "ÖSSZESEN", "TOTAL", "ÖSSZEG", or "FIZETENDŐ"
              - Extract merchant name from the top of the receipt (LIDL, TESCO, SPAR, etc.)
              - Extract date in YYYY-MM-DD format
              - For items, extract name and price from each line
              - Set quantity to 1 if not specified
              - Currency should be "HUF" for Hungarian receipts
              - Confidence should be 0.8-0.95 for good analysis`
            },
            {
              type: "image_url",
              image_url: { 
                url: `data:${mimeType};base64,${base64Image}` 
              },
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const result = JSON.parse(content);
    
    // Validate and clean the result
    const cleanedResult = {
      totalAmount: result.totalAmount || 0,
      merchant: result.merchant || 'Ismeretlen',
      date: result.date || new Date().toISOString().split('T')[0],
      items: Array.isArray(result.items) ? result.items.map((item: any) => ({
        name: item.name || 'Ismeretlen tétel',
        price: item.price || 0,
        quantity: item.quantity || 1
      })) : [],
      currency: result.currency || 'HUF',
      confidence: Math.min(Math.max(result.confidence || 0.8, 0), 1),
      note: 'OpenAI Vision API elemzés'
    };

    return { success: true, analysis: cleanedResult };

  } catch (err) {
    console.error("OpenAI Vision analysis failed:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return { success: false, message: errorMessage };
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await form.parse(req);
    
    const billImage = Array.isArray(files.billImage) ? files.billImage[0] : files.billImage;
    
    if (!billImage) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // For deployment environments, use the temporary file directly
    // The file is already in a temporary location that we can access
    const imageUrl = billImage.filepath;

    // Analyze the image using OpenAI Vision API
    const result = await analyzeBillImage(imageUrl);
    
    // Clean up the temporary file
    try {
      if (fs.existsSync(billImage.filepath)) {
        fs.unlinkSync(billImage.filepath);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup temporary file:', cleanupError);
    }
    
    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        ocrData: result.analysis 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: result.message 
      });
    }

  } catch (error) {
    console.error('Upload bill error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
}
