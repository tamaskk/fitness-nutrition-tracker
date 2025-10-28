import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, error, scope } = req.query;

  console.log('🔵 Strava OAuth callback received');
  console.log('Code present:', !!code);
  console.log('Error:', error);

  // Check if user denied authorization
  if (error) {
    console.log('❌ User denied authorization');
    return res.redirect('/profile?strava_error=denied');
  }

  // Check if authorization code is present
  if (!code || typeof code !== 'string') {
    console.log('❌ No authorization code received');
    return res.redirect('/profile?strava_error=no_code');
  }

  // Get Strava OAuth credentials
  const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || '183040';
  const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '8d8e3b5dda6fa9f0871809f245a4cce3486e931b';

  console.log('Client ID present:', !!STRAVA_CLIENT_ID);
  console.log('Client Secret present:', !!STRAVA_CLIENT_SECRET);

  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
    console.log('❌ Missing Strava OAuth credentials');
    return res.redirect('/profile?strava_error=config');
  }

  try {
    console.log('🔄 Exchanging authorization code for token...');
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    console.log('Token exchange response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Strava token exchange failed:', errorText);
      return res.redirect('/profile?strava_error=exchange_failed');
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token received successfully');
    console.log('Athlete ID:', tokenData.athlete?.id);
    console.log('Athlete username:', tokenData.athlete?.username);

    // Token data contains:
    // - access_token: The access token
    // - refresh_token: Token to refresh expired access tokens
    // - expires_at: Unix timestamp when token expires
    // - athlete: Basic athlete info

    const { access_token, refresh_token, expires_at, athlete } = tokenData;

    console.log('🔍 Getting authenticated user...');
    
    // Get authenticated user
    const tokenUser = getUserFromToken(req);
    const session = await getServerSession(req, res, authOptions);
    
    console.log('Token user:', tokenUser?.email);
    console.log('Session user:', session?.user?.email);
    
    const userEmail = tokenUser?.email || session?.user?.email;
    
    if (!userEmail) {
      console.log('❌ No authenticated user found');
      return res.redirect('/login?redirect=/profile');
    }

    console.log('✅ User authenticated:', userEmail);
    console.log('💾 Saving to database...');

    // Save to database
    await connectToDatabase();
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('❌ User not found in database:', userEmail);
      return res.redirect('/profile?strava_error=user_not_found');
    }

    console.log('✅ User found in database');

    // Store Strava connection
    user.stravaConnection = {
      accessToken: access_token,
      refreshToken: refresh_token,
      athleteId: athlete?.id?.toString(),
      username: athlete?.username,
      connectedAt: new Date(),
      lastSyncedAt: new Date(),
    };

    await user.save();

    console.log('✅ Strava connected successfully via OAuth for user:', userEmail);
    console.log('🎉 Redirecting to profile with success message');

    // Redirect back to profile with success message
    res.redirect('/profile?strava_success=true');
  } catch (error) {
    console.error('Strava OAuth callback error:', error);
    res.redirect('/profile?strava_error=unknown');
  }
}

