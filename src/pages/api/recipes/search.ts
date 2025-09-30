// This API endpoint is no longer needed - recipe search is now done directly from the frontend
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({ 
    message: 'This endpoint has been deprecated. Recipe search is now handled client-side.' 
  });
}

