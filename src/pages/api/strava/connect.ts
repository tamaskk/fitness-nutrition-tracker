import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for JWT token first (for mobile app), then NextAuth session (for web app)
  const tokenUser = getUserFromToken(req);
  const session = await getServerSession(req, res, authOptions);
  
  const userEmail = tokenUser?.email || session?.user?.email;
  
  if (!userEmail) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      // Connect Strava account
      const { accessToken, refreshToken, athleteId, username } = req.body;

      if (!accessToken) {
        return res.status(400).json({ message: 'Access token is required' });
      }

      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Save Strava connection
      user.stravaConnection = {
        accessToken,
        refreshToken: refreshToken || undefined,
        athleteId: athleteId || undefined,
        username: username || undefined,
        connectedAt: new Date(),
        lastSyncedAt: new Date(),
      };

      await user.save();

      console.log('Strava connected successfully for user:', userEmail);

      res.status(200).json({
        message: 'Strava connected successfully',
        stravaConnection: {
          athleteId: user.stravaConnection.athleteId,
          username: user.stravaConnection.username,
          connectedAt: user.stravaConnection.connectedAt,
        },
      });
    } else if (req.method === 'DELETE') {
      // Disconnect Strava account
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.stravaConnection = undefined;
      await user.save();

      console.log('Strava disconnected successfully for user:', userEmail);

      res.status(200).json({
        message: 'Strava disconnected successfully',
      });
    } else if (req.method === 'GET') {
      // Get Strava connection status
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.stravaConnection?.accessToken) {
        return res.status(200).json({
          connected: false,
          message: 'Strava not connected',
        });
      }

      res.status(200).json({
        connected: true,
        stravaConnection: {
          athleteId: user.stravaConnection.athleteId,
          username: user.stravaConnection.username,
          connectedAt: user.stravaConnection.connectedAt,
          lastSyncedAt: user.stravaConnection.lastSyncedAt,
        },
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Strava connection API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

