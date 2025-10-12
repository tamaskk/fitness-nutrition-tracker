import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import BugReport from '@/models/BugReport';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, description, pageUrl } = req.body || {};
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    await connectToDatabase();

    const report = await BugReport.create({
      userId: session.user.id,
      email: session.user.email,
      title: String(title).trim(),
      description: String(description).trim(),
      pageUrl: pageUrl ? String(pageUrl).trim() : undefined,
    });

    return res.status(201).json({ message: 'Bug report submitted', reportId: report._id });
  } catch (error) {
    console.error('Bug report error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}



