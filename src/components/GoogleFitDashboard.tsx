import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface FitnessData {
  dataType: string;
  startDate: string;
  endDate: string;
  buckets: Array<{
    startTime: string;
    endTime: string;
    dataset: Array<{
      value: Array<{ intVal?: number; fpVal?: number }>;
    }>;
  }>;
}

interface ActivitySession {
  id: string;
  name: string;
  activityType: number;
  startTime: string;
  endTime: string;
  activeTimeMillis: number;
}

/**
 * Google Fit Dashboard Component
 * 
 * Example component demonstrating how to fetch and display Google Fit data
 * 
 * Usage:
 * import GoogleFitDashboard from '@/components/GoogleFitDashboard';
 * 
 * <GoogleFitDashboard />
 */
export default function GoogleFitDashboard() {
  const { data: session } = useSession();
  const [steps, setSteps] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const hasGoogleAuth = session?.accessToken;

  /**
   * Fetch fitness data for a specific data type
   */
  const fetchFitnessData = async (dataType: string): Promise<FitnessData | null> => {
    try {
      const response = await fetch(
        `/api/google-fit/data?dataType=${dataType}&startDate=${getSevenDaysAgo()}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }
      
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${dataType}:`, err);
      return null;
    }
  };

  /**
   * Calculate total value from buckets
   */
  const calculateTotal = (data: FitnessData | null): number => {
    if (!data) return 0;
    
    return data.buckets.reduce((total, bucket) => {
      const bucketTotal = bucket.dataset.reduce((sum, point) => {
        const value = point.value?.[0]?.intVal ?? point.value?.[0]?.fpVal ?? 0;
        return sum + value;
      }, 0);
      return total + bucketTotal;
    }, 0);
  };

  /**
   * Fetch all fitness data
   */
  const fetchAllData = async () => {
    if (!hasGoogleAuth) {
      setError('Please sign in with Google to access fitness data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch steps
      const stepsData = await fetchFitnessData('steps');
      if (stepsData) {
        setSteps(calculateTotal(stepsData));
      }

      // Fetch calories
      const caloriesData = await fetchFitnessData('calories');
      if (caloriesData) {
        setCalories(Math.round(calculateTotal(caloriesData)));
      }

      // Fetch distance
      const distanceData = await fetchFitnessData('distance');
      if (distanceData) {
        // Convert meters to kilometers
        setDistance(calculateTotal(distanceData) / 1000);
      }

      // Fetch activity sessions
      const sessionsResponse = await fetch('/api/google-fit/sessions');
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get ISO date string for 7 days ago
   */
  const getSevenDaysAgo = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString();
  };

  /**
   * Format duration from milliseconds to readable string
   */
  const formatDuration = (milliseconds: number): string => {
    const minutes = Math.round(milliseconds / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  /**
   * Get activity name from type ID
   */
  const getActivityName = (typeId: number): string => {
    const activityNames: Record<number, string> = {
      0: 'In vehicle',
      1: 'Biking',
      7: 'Walking',
      8: 'Running',
      9: 'Aerobics',
      10: 'Badminton',
      11: 'Baseball',
      12: 'Basketball',
      15: 'Dancing',
      26: 'Hiking',
      58: 'Swimming',
      73: 'Yoga',
    };
    return activityNames[typeId] || `Activity ${typeId}`;
  };

  // Auto-fetch data when component mounts if user is authenticated
  useEffect(() => {
    if (hasGoogleAuth) {
      fetchAllData();
    }
  }, [hasGoogleAuth]);

  if (!hasGoogleAuth) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Google Fit Integration</h2>
        <p className="text-gray-700">
          Sign in with Google to access your fitness data from Google Fit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Google Fit Dashboard</h2>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Steps Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Steps (7 days)</p>
              <p className="text-3xl font-bold mt-1">
                {steps.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">👟</div>
          </div>
        </div>

        {/* Calories Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Calories (7 days)</p>
              <p className="text-3xl font-bold mt-1">
                {calories.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">🔥</div>
          </div>
        </div>

        {/* Distance Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Distance (7 days)</p>
              <p className="text-3xl font-bold mt-1">
                {distance.toFixed(1)} km
              </p>
            </div>
            <div className="text-4xl">📍</div>
          </div>
        </div>
      </div>

      {/* Activity Sessions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activities</h3>
        
        {sessions.length === 0 ? (
          <p className="text-gray-500">No recent activity sessions found.</p>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 10).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold">
                    {session.name || getActivityName(session.activityType)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.startTime).toLocaleDateString()} at{' '}
                    {new Date(session.startTime).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatDuration(session.activeTimeMillis)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getActivityName(session.activityType)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="text-sm text-gray-500 text-center">
        Data synced from Google Fit. Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

