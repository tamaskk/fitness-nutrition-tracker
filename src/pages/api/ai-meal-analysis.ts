import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';
import { getUserFromToken } from '@/utils/auth';
import User from '@/models/User';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000,
});

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll use formidable
  },
  maxDuration: 60,
};

// Parse form data with formidable
const parseForm = async (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tokenUser = getUserFromToken(req);
    const session = await getServerSession(req, res, authOptions);
    
    const userEmail = tokenUser?.email || session?.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = user._id as string;

    // Parse the multipart form data
    const { fields, files } = await parseForm(req);
    
    // Get the uploaded file
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    
    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('📷 Image received:', imageFile.originalFilename, imageFile.size, 'bytes');

    // Read file buffer
    const fileBuffer = fs.readFileSync(imageFile.filepath);
    
    // Upload to Firebase Storage
    const timestamp = Date.now();
    const fileName = `meal-analysis/${userId}/${timestamp}_${imageFile.originalFilename}`;
    const storageRef = ref(storage, fileName);
    
    console.log('☁️ Uploading to Firebase:', fileName);
    
    await uploadBytes(storageRef, fileBuffer, {
      contentType: imageFile.mimetype || 'image/jpeg',
    });
    
    // Get public download URL
    const imageUrl = await getDownloadURL(storageRef);
    console.log('✅ Firebase URL:', imageUrl);

    // Analyze with OpenAI Vision
    console.log('🤖 Analyzing with OpenAI Vision...');
    
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Te egy professzionális táplálkozási tanácsadó vagy, aki szakértő az ételek tápértékeinek elemzésében. 
          
Feladatod: Egy étel képének elemzése és részletes táplálkozási információk megadása.

Válaszolj JSON formátumban a következő struktúrával:
{
  "foodName": "Az étel neve magyarul",
  "description": "Rövid leírás az ételről (1-2 mondat)",
  "estimatedWeight": {
    "value": számérték,
    "unit": "g vagy ml"
  },
  "totalNutrition": {
    "calories": kalória (kcal),
    "protein": fehérje (g),
    "carbs": szénhidrát (g),
    "fat": zsír (g),
    "fiber": rost (g),
    "sugar": cukor (g)
  },
  "ingredients": [
    {
      "name": "hozzávaló neve",
      "estimatedWeight": {
        "value": becsült súly,
        "unit": "g"
      },
      "calories": kalória ebből a hozzávalóból,
      "protein": fehérje (g),
      "carbs": szénhidrát (g),
      "fat": zsír (g)
    }
  ],
  "portionSize": "1 adag / 2 adag / stb.",
  "healthScore": 1-10 közötti egész szám,
  "healthNotes": "Egészségügyi megjegyzések, javaslatok",
  "warnings": ["Allergiás figyelmeztetések, ha van"],
  "mealType": "reggeli/ebéd/vacsora/desszert/uzsonna",
  "confidence": "high/medium/low - mennyire biztos vagy az elemzésben"
}

FONTOS:
- Legyél precíz és realisztikus a becsléseknél
- Ha nem vagy biztos valamiben, jelezd a confidence-ben
- Minden érték számérték legyen (ne string)
- Minden szöveg magyarul legyen`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Kérlek elemezd ezt az ételt! Add meg a teljes táplálkozási információt, a hozzávalókat súlyukkal együtt, és minden hozzávaló tápértékét külön-külön. Légy részletes és pontos!"
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high" // High detail for better analysis
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    console.log('✅ OpenAI analysis complete');

    const analysis = JSON.parse(content);

    // Clean up temporary file
    fs.unlinkSync(imageFile.filepath);

    return res.status(200).json({
      success: true,
      imageUrl,
      analysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI meal analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false,
      error: errorMessage 
    });
  }
}

