import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check for JWT token first (for mobile app), then NextAuth session (for web app)
  const tokenUser = getUserFromToken(req);
  const session = await getServerSession(req, res, authOptions);
  
  const userEmail = tokenUser?.email || session?.user?.email;
  
  if (!userEmail) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const accessToken = user.stravaConnection?.accessToken;
    if (!accessToken) {
      return res.status(400).json({ message: 'Strava not connected. Please connect your Strava account first.' });
    }

    // Fetch athlete data from Strava API
    const stravaResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!stravaResponse.ok) {
      if (stravaResponse.status === 401) {
        return res.status(401).json({ 
          message: 'Strava token expired or invalid. Please reconnect your Strava account.',
          needsReconnect: true,
        });
      }
      throw new Error(`Strava API error: ${stravaResponse.statusText}`);
    }

    const athleteData = await stravaResponse.json();

    // Update last synced time
    user.stravaConnection.lastSyncedAt = new Date();
    await user.save();

    res.status(200).json({
      athlete: {
        id: athleteData.id,
        username: athleteData.username,
        firstname: athleteData.firstname,
        lastname: athleteData.lastname,
        city: athleteData.city,
        state: athleteData.state,
        country: athleteData.country,
        sex: athleteData.sex,
        weight: athleteData.weight,
        profile: athleteData.profile,
        profile_medium: athleteData.profile_medium,
      },
    });
  } catch (error) {
    console.error('Strava athlete API error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch Strava athlete data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

