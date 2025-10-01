import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";
import { analyzeBillImage as analyzeBillImageDirect } from './analyze-bill-direct';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeBillImage(imageUrl: string) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // Using the latest mini model
      messages: [
        {
          role: "system",
          content: "You are a receipt OCR and parser. Extract structured data.",
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
                totalAmount: number
              }`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            }
          ],
        },
      ],
      response_format: { type: "json_object" }, // force structured JSON
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const result = JSON.parse(content);
    return { success: true, analysis: result };

  } catch (err) {
    console.error("GPT receipt analysis failed:", err);
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

    // Analyze the image using the temporary file path
    const result = await analyzeBillImageDirect(imageUrl);
    
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
