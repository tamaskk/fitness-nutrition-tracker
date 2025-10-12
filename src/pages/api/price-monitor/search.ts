import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q, limit = '24', offset = '0', order = 'relevance' } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const encodedQuery = encodeURIComponent(q.trim());
    const url = `https://arfigyelo.gvh.hu/api/search?q=${encodedQuery}&limit=${limit}&offset=${offset}&order=${order}`;
    
    console.log('Fetching from:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'hu-HU,hu;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      // Retry once with a different order parameter as a fallback
      const fallbackUrl = `https://arfigyelo.gvh.hu/api/search?q=${encodedQuery}&limit=${limit}&offset=${offset}&order=freshness`;
      console.log('Retrying with:', fallbackUrl);
      const retryResponse = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'hu-HU,hu;q=0.9,en;q=0.8',
        },
      });

      if (!retryResponse.ok) {
        // Graceful empty payload so frontend can handle without errors
        return res.status(200).json({ products: [], count: 0 });
      }

      const retryData = await retryResponse.json();
      return res.status(200).json(retryData);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Price monitor API error:', error);
    // Graceful empty payload on unexpected failures
    res.status(200).json({ products: [], count: 0 });
  }
}
