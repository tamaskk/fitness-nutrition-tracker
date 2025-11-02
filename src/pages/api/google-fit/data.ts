import { getToken } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Google Fit API - Fetch fitness data
 * GET /api/google-fit/data
 * 
 * Query Parameters:
 * - dataType: The type of data to fetch (steps, calories, heart_rate, distance, weight, sleep)
 * - startDate: ISO date string for start of range (defaults to 7 days ago)
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
    const { dataType = 'steps', startDate, endDate } = req.query;
    
    // Calculate time range (default to last 7 days)
    const endTime = endDate ? new Date(endDate as string).getTime() : Date.now();
    const startTime = startDate 
      ? new Date(startDate as string).getTime() 
      : endTime - (7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Map data types to Google Fit data source IDs
    const dataTypeMap: Record<string, { dataTypeName: string; dataSourceId: string }> = {
      steps: {
        dataTypeName: 'com.google.step_count.delta',
        dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
      },
      calories: {
        dataTypeName: 'com.google.calories.expended',
        dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
      },
      heart_rate: {
        dataTypeName: 'com.google.heart_rate.bpm',
        dataSourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
      },
      distance: {
        dataTypeName: 'com.google.distance.delta',
        dataSourceId: 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta',
      },
      weight: {
        dataTypeName: 'com.google.weight',
        dataSourceId: 'derived:com.google.weight:com.google.android.gms:merge_weight',
      },
      sleep: {
        dataTypeName: 'com.google.sleep.segment',
        dataSourceId: 'derived:com.google.sleep.segment:com.google.android.gms:merged',
      },
      active_minutes: {
        dataTypeName: 'com.google.active_minutes',
        dataSourceId: 'derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes',
      },
      speed: {
        dataTypeName: 'com.google.speed',
        dataSourceId: 'derived:com.google.speed:com.google.android.gms:merge_speed',
      },
    };

    const dataConfig = dataTypeMap[dataType as string];
    if (!dataConfig) {
      return res.status(400).json({ 
        error: `Invalid data type. Supported types: ${Object.keys(dataTypeMap).join(', ')}` 
      });
    }

    // Make request to Google Fit API
    const response = await fetch(
      'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateBy: [
            {
              dataTypeName: dataConfig.dataTypeName,
              dataSourceId: dataConfig.dataSourceId,
            },
          ],
          bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Fit API error:', response.status, errorText);
      
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Google authentication expired. Please sign in again.' 
        });
      }
      
      return res.status(response.status).json({ 
        error: 'Failed to fetch data from Google Fit',
        details: errorText,
      });
    }

    const data = await response.json();
    
    // Format the response data
    const formattedData = {
      dataType: dataType,
      startDate: new Date(startTime).toISOString(),
      endDate: new Date(endTime).toISOString(),
      buckets: data.bucket?.map((bucket: any) => ({
        startTime: new Date(parseInt(bucket.startTimeMillis)).toISOString(),
        endTime: new Date(parseInt(bucket.endTimeMillis)).toISOString(),
        dataset: bucket.dataset?.[0]?.point || [],
      })) || [],
      raw: data, // Include raw response for debugging
    };

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching Google Fit data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

