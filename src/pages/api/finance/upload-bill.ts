import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'public', 'uploads', 'bills'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `bill-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Create uploads directory if it doesn't exist
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'bills');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
};

export const config = {
  api: {
    bodyParser: false,
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

    await ensureUploadsDir();

    // Handle file upload
    await new Promise((resolve, reject) => {
      upload.single('billImage')(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/bills/${file.filename}`;
    
    // Analyze the bill with ChatGPT
    try {
      const analysisResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/finance/analyze-bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${fileUrl}`
        }),
      });

      if (analysisResponse.ok) {
        const analysisResult = await analysisResponse.json();
        res.status(200).json({
          success: true,
          fileUrl,
          ocrData: analysisResult.analysis,
        });
      } else {
        const errorData = await analysisResponse.json();
        console.log('Analysis failed:', errorData);
        
        // Fallback to mock data if analysis fails
        const mockOcrData = {
          totalAmount: Math.floor(Math.random() * 10000) + 1000,
          items: [
            { name: 'Tej 1L', price: 350, quantity: 1 },
            { name: 'Kenyér', price: 280, quantity: 1 },
            { name: 'Tojás 10db', price: 450, quantity: 1 },
            { name: 'Alma 1kg', price: 320, quantity: 1 },
          ],
          merchant: 'Tesco',
          date: new Date().toISOString(),
          confidence: 0.3,
          note: 'OpenAI API nem elérhető - minta adatok'
        };

        res.status(200).json({
          success: true,
          fileUrl,
          ocrData: mockOcrData,
        });
      }
    } catch (analysisError) {
      console.error('Analysis error:', analysisError);
      
      // Fallback to mock data
      const mockOcrData = {
        totalAmount: Math.floor(Math.random() * 10000) + 1000,
        items: [
          { name: 'Tej 1L', price: 350, quantity: 1 },
          { name: 'Kenyér', price: 280, quantity: 1 },
          { name: 'Tojás 10db', price: 450, quantity: 1 },
          { name: 'Alma 1kg', price: 320, quantity: 1 },
        ],
        merchant: 'Tesco',
        date: new Date().toISOString(),
        confidence: 0.3,
        note: 'OpenAI API hiba - minta adatok'
      };

      res.status(200).json({
        success: true,
        fileUrl,
        ocrData: mockOcrData,
      });
    }

  } catch (error) {
    console.error('Bill upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
