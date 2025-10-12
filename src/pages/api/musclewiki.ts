import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { limit = '4', offset = '0', category = '', status = 'Published', ordering = '-featured_weight', muscles = '1' } = req.query;

  const queryParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    category: String(category),
    status: String(status),
    ordering: String(ordering),
    muscles: String(muscles),
  });

  const apiUrl = `https://musclewiki.com/newapi/exercise/exercises/?${queryParams.toString()}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error fetching data' });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching data' });
  }
}



