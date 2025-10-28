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

    // First get the athlete to ensure we have the athlete ID
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!athleteResponse.ok) {
      if (athleteResponse.status === 401) {
        return res.status(401).json({ 
          message: 'Strava token expired or invalid. Please reconnect your Strava account.',
          needsReconnect: true,
        });
      }
      throw new Error(`Strava API error: ${athleteResponse.statusText}`);
    }

    const athlete = await athleteResponse.json();
    const athleteId = athlete.id || user.stravaConnection.athleteId;

    // Fetch athlete stats from Strava API
    const statsResponse = await fetch(
      `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!statsResponse.ok) {
      if (statsResponse.status === 401) {
        return res.status(401).json({ 
          message: 'Strava token expired or invalid. Please reconnect your Strava account.',
          needsReconnect: true,
        });
      }
      throw new Error(`Strava API error: ${statsResponse.statusText}`);
    }

    const stats = await statsResponse.json();

    // Update last synced time
    user.stravaConnection.lastSyncedAt = new Date();
    await user.save();

    res.status(200).json({
      stats: {
        // Recent totals (last 4 weeks)
        recentRideTotals: {
          count: stats.recent_ride_totals?.count || 0,
          distance: stats.recent_ride_totals?.distance || 0,
          movingTime: stats.recent_ride_totals?.moving_time || 0,
          elapsedTime: stats.recent_ride_totals?.elapsed_time || 0,
          elevationGain: stats.recent_ride_totals?.elevation_gain || 0,
        },
        recentRunTotals: {
          count: stats.recent_run_totals?.count || 0,
          distance: stats.recent_run_totals?.distance || 0,
          movingTime: stats.recent_run_totals?.moving_time || 0,
          elapsedTime: stats.recent_run_totals?.elapsed_time || 0,
          elevationGain: stats.recent_run_totals?.elevation_gain || 0,
        },
        recentSwimTotals: {
          count: stats.recent_swim_totals?.count || 0,
          distance: stats.recent_swim_totals?.distance || 0,
          movingTime: stats.recent_swim_totals?.moving_time || 0,
          elapsedTime: stats.recent_swim_totals?.elapsed_time || 0,
          elevationGain: stats.recent_swim_totals?.elevation_gain || 0,
        },
        
        // Year-to-date totals
        ytdRideTotals: {
          count: stats.ytd_ride_totals?.count || 0,
          distance: stats.ytd_ride_totals?.distance || 0,
          movingTime: stats.ytd_ride_totals?.moving_time || 0,
          elapsedTime: stats.ytd_ride_totals?.elapsed_time || 0,
          elevationGain: stats.ytd_ride_totals?.elevation_gain || 0,
        },
        ytdRunTotals: {
          count: stats.ytd_run_totals?.count || 0,
          distance: stats.ytd_run_totals?.distance || 0,
          movingTime: stats.ytd_run_totals?.moving_time || 0,
          elapsedTime: stats.ytd_run_totals?.elapsed_time || 0,
          elevationGain: stats.ytd_run_totals?.elevation_gain || 0,
        },
        ytdSwimTotals: {
          count: stats.ytd_swim_totals?.count || 0,
          distance: stats.ytd_swim_totals?.distance || 0,
          movingTime: stats.ytd_swim_totals?.moving_time || 0,
          elapsedTime: stats.ytd_swim_totals?.elapsed_time || 0,
          elevationGain: stats.ytd_swim_totals?.elevation_gain || 0,
        },
        
        // All-time totals
        allRideTotals: {
          count: stats.all_ride_totals?.count || 0,
          distance: stats.all_ride_totals?.distance || 0,
          movingTime: stats.all_ride_totals?.moving_time || 0,
          elapsedTime: stats.all_ride_totals?.elapsed_time || 0,
          elevationGain: stats.all_ride_totals?.elevation_gain || 0,
        },
        allRunTotals: {
          count: stats.all_run_totals?.count || 0,
          distance: stats.all_run_totals?.distance || 0,
          movingTime: stats.all_run_totals?.moving_time || 0,
          elapsedTime: stats.all_run_totals?.elapsed_time || 0,
          elevationGain: stats.all_run_totals?.elevation_gain || 0,
        },
        allSwimTotals: {
          count: stats.all_swim_totals?.count || 0,
          distance: stats.all_swim_totals?.distance || 0,
          movingTime: stats.all_swim_totals?.moving_time || 0,
          elapsedTime: stats.all_swim_totals?.elapsed_time || 0,
          elevationGain: stats.all_swim_totals?.elevation_gain || 0,
        },
      },
    });
  } catch (error) {
    console.error('Strava stats API error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch Strava stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

