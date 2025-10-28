import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Strava OAuth configuration
  // You need to create a Strava app at: https://www.strava.com/settings/api
  const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || '183040';
  
  if (!STRAVA_CLIENT_ID) {
    return res.status(500).json({ 
      message: 'Strava Client ID not configured. Please add STRAVA_CLIENT_ID to your environment variables.',
      setup: 'Create a Strava app at https://www.strava.com/settings/api'
    });
  }

  // Redirect URI - where Strava will send the user after authorization
  const REDIRECT_URI = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/strava/oauth/callback`;
  
  // Build Strava authorization URL
  const authUrl = new URL('https://www.strava.com/oauth/authorize');
  authUrl.searchParams.set('client_id', STRAVA_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('approval_prompt', 'auto'); // 'auto' or 'force'
  authUrl.searchParams.set('scope', 'read,activity:read_all,profile:read_all'); // Permissions we need

  // Redirect user to Strava authorization page
  res.redirect(authUrl.toString());
}

