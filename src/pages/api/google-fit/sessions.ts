import { getToken } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Google Fit API - Fetch activity sessions
 * GET /api/google-fit/sessions
 * 
 * Query Parameters:
 * - startDate: ISO date string for start of range (defaults to 30 days ago)
 * - endDate: ISO date string for end of range (defaults to now)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user's access token from NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.accessToken) {
      return res.status(401).json({ 
        error: 'Not authenticated with Google. Please sign in with Google to access Fit data.' 
      });
    }

    // Parse query parameters
    const { startDate, endDate } = req.query;
    
    // Calculate time range (default to last 30 days)
    const endTime = endDate ? new Date(endDate as string).getTime() : Date.now();
    const startTime = startDate 
      ? new Date(startDate as string).getTime() 
      : endTime - (30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Build URL with query parameters
    const url = new URL('https://www.googleapis.com/fitness/v1/users/me/sessions');
    url.searchParams.append('startTime', new Date(startTime).toISOString());
    url.searchParams.append('endTime', new Date(endTime).toISOString());

    // Make request to Google Fit API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Fit API error:', response.status, errorText);
      
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Google authentication expired. Please sign in again.' 
        });
      }
      
      return res.status(response.status).json({ 
        error: 'Failed to fetch sessions from Google Fit',
        details: errorText,
      });
    }

    const data = await response.json();
    
    // Format the response data
    const formattedData = {
      startDate: new Date(startTime).toISOString(),
      endDate: new Date(endTime).toISOString(),
      sessions: data.session?.map((session: any) => ({
        id: session.id,
        name: session.name,
        description: session.description,
        activityType: session.activityType,
        application: session.application,
        startTime: new Date(parseInt(session.startTimeMillis)).toISOString(),
        endTime: new Date(parseInt(session.endTimeMillis)).toISOString(),
        modifiedTime: session.modifiedTimeMillis 
          ? new Date(parseInt(session.modifiedTimeMillis)).toISOString() 
          : null,
        activeTimeMillis: session.activeTimeMillis,
      })) || [],
      raw: data, // Include raw response for debugging
    };

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching Google Fit sessions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

