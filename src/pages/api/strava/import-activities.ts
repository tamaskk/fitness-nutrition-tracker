import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import WorkoutSession from '@/models/WorkoutSession';
import { getUserFromToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const { activityIds } = req.body;

    if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({ message: 'Activity IDs array is required' });
    }

    const accessToken = user.stravaConnection?.accessToken;
    if (!accessToken) {
      return res.status(400).json({ message: 'Strava not connected. Please connect your Strava account first.' });
    }

    const imported = [];
    const skipped = [];
    const failed = [];

    for (const activityId of activityIds) {
      try {
        // Check if already imported
        const existingSession = await WorkoutSession.findOne({
          userId: user._id,
          planId: `strava_${activityId}`,
        });

        if (existingSession) {
          skipped.push({ activityId, reason: 'Already imported' });
          continue;
        }

        // Fetch activity from Strava
        const stravaResponse = await fetch(
          `https://www.strava.com/api/v3/activities/${activityId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!stravaResponse.ok) {
          failed.push({ activityId, reason: `Strava API error: ${stravaResponse.status}` });
          continue;
        }

        const activity = await stravaResponse.json();

        // Convert to WorkoutSession
        const startTime = new Date(activity.start_date);
        const endTime = new Date(startTime.getTime() + (activity.elapsed_time * 1000));
        
        const exercise = createExerciseFromActivity(activity);

        const workoutSession = new WorkoutSession({
          userId: user._id,
          planId: `strava_${activityId}`,
          workoutPlanName: activity.name || `${activity.type} Activity`,
          exercises: [exercise],
          startTime,
          endTime,
          durationSeconds: activity.elapsed_time,
          totalSets: 1,
          completedSets: 1,
          caloriesBurned: activity.calories || estimateCalories(activity),
          bodyWeight: user.weight?.value || undefined,
          status: 'completed',
          createdAt: startTime,
        });

        await workoutSession.save();
        imported.push({ activityId, name: activity.name });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        failed.push({ 
          activityId, 
          reason: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    console.log(`✅ Imported ${imported.length} Strava activities for user:`, userEmail);

    res.status(200).json({
      message: 'Import completed',
      summary: {
        total: activityIds.length,
        imported: imported.length,
        skipped: skipped.length,
        failed: failed.length,
      },
      imported,
      skipped,
      failed,
    });
  } catch (error) {
    console.error('Strava bulk import error:', error);
    res.status(500).json({ 
      message: 'Failed to import Strava activities',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function createExerciseFromActivity(activity: any) {
  const activityTypeMap: { [key: string]: string } = {
    'Run': 'Running',
    'Ride': 'Cycling',
    'Swim': 'Swimming',
    'Walk': 'Walking',
    'Hike': 'Hiking',
    'WeightTraining': 'Weight Training',
    'Workout': 'Workout',
    'Yoga': 'Yoga',
    'Crossfit': 'Crossfit',
    'Elliptical': 'Elliptical',
    'StairStepper': 'Stair Stepper',
    'RockClimbing': 'Rock Climbing',
    'default': 'Cardio Exercise',
  };

  const exerciseName = activityTypeMap[activity.type] || activityTypeMap['default'];

  return {
    exerciseId: `strava_${activity.type.toLowerCase()}`,
    name: exerciseName,
    gifUrl: getGifUrlForActivity(activity.type),
    targetMuscles: getTargetMusclesForActivity(activity.type),
    bodyParts: getBodyPartsForActivity(activity.type),
    equipments: getEquipmentForActivity(activity.type),
    sets: [{
      setNumber: 1,
      weight: 0,
      reps: 0,
      restSeconds: 0,
      isCompleted: true,
    }],
    notes: `Distance: ${(activity.distance / 1000).toFixed(2)} km, ` +
           `Avg Speed: ${((activity.average_speed * 3.6).toFixed(2))} km/h` +
           (activity.total_elevation_gain ? `, Elevation: ${activity.total_elevation_gain}m` : '') +
           (activity.kilojoules ? `, Energy: ${activity.kilojoules} kJ` : ''),
  };
}

function estimateCalories(activity: any): number {
  if (activity.calories) return activity.calories;
  
  const durationHours = activity.moving_time / 3600;
  const caloriesPerHourMap: { [key: string]: number } = {
    'Run': 600, 'Ride': 400, 'Swim': 500, 'Walk': 250,
    'Hike': 400, 'WeightTraining': 350, 'Workout': 400, 'default': 300,
  };
  
  const caloriesPerHour = caloriesPerHourMap[activity.type] || caloriesPerHourMap['default'];
  return Math.round(caloriesPerHour * durationHours);
}

function getTargetMusclesForActivity(type: string): string[] {
  const muscleMap: { [key: string]: string[] } = {
    'Run': ['quadriceps', 'hamstrings', 'calves', 'glutes'],
    'Ride': ['quadriceps', 'hamstrings', 'calves', 'glutes'],
    'Swim': ['lats', 'shoulders', 'triceps', 'core'],
    'Walk': ['quadriceps', 'calves'],
    'Hike': ['quadriceps', 'hamstrings', 'calves', 'glutes'],
    'WeightTraining': ['full body'],
    'default': ['cardiovascular'],
  };
  return muscleMap[type] || muscleMap['default'];
}

function getBodyPartsForActivity(type: string): string[] {
  const bodyPartMap: { [key: string]: string[] } = {
    'Run': ['legs', 'cardio'], 'Ride': ['legs', 'cardio'],
    'Swim': ['upper body', 'cardio'], 'Walk': ['legs', 'cardio'],
    'Hike': ['legs', 'cardio'], 'WeightTraining': ['full body'],
    'default': ['cardio'],
  };
  return bodyPartMap[type] || bodyPartMap['default'];
}

function getEquipmentForActivity(type: string): string[] {
  const equipmentMap: { [key: string]: string[] } = {
    'Run': ['none'], 'Ride': ['bicycle'], 'Swim': ['pool'],
    'Walk': ['none'], 'Hike': ['none'], 'WeightTraining': ['various'],
    'default': ['none'],
  };
  return equipmentMap[type] || equipmentMap['default'];
}

function getGifUrlForActivity(type: string): string {
  const gifMap: { [key: string]: string } = {
    'Run': 'https://v2.exercisedb.io/image/placeholder-cardio-run',
    'Ride': 'https://v2.exercisedb.io/image/placeholder-cardio-bike',
    'Swim': 'https://v2.exercisedb.io/image/placeholder-cardio-swim',
    'Walk': 'https://v2.exercisedb.io/image/placeholder-cardio-walk',
    'Hike': 'https://v2.exercisedb.io/image/placeholder-cardio-hike',
    'WeightTraining': 'https://v2.exercisedb.io/image/placeholder-strength',
    'Workout': 'https://v2.exercisedb.io/image/placeholder-workout',
    'Yoga': 'https://v2.exercisedb.io/image/placeholder-yoga',
    'default': 'https://v2.exercisedb.io/image/placeholder-cardio',
  };
  return gifMap[type] || gifMap['default'];
}

