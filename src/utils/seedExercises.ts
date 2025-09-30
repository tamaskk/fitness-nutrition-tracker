import connectToDatabase from '@/lib/mongodb';
import Exercise from '@/models/Exercise';

const exerciseData = [
  // Bodyweight exercises
  {
    name: 'Push-ups',
    type: 'bodyweight',
    caloriesPerRep: 0.5,
    defaultReps: 15,
    defaultSets: 3,
    description: 'Classic bodyweight exercise for chest, shoulders, and triceps',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
  },
  {
    name: 'Squats',
    type: 'bodyweight',
    caloriesPerRep: 0.6,
    defaultReps: 20,
    defaultSets: 3,
    description: 'Lower body exercise targeting quadriceps, glutes, and hamstrings',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
  },
  {
    name: 'Plank',
    type: 'bodyweight',
    caloriesPerMinute: 3,
    defaultReps: 60, // seconds
    defaultSets: 3,
    description: 'Core strengthening exercise',
    muscleGroups: ['core', 'abs'],
  },
  {
    name: 'Lunges',
    type: 'bodyweight',
    caloriesPerRep: 0.7,
    defaultReps: 12,
    defaultSets: 3,
    description: 'Single-leg exercise for lower body strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
  },
  {
    name: 'Burpees',
    type: 'bodyweight',
    caloriesPerRep: 1.2,
    defaultReps: 10,
    defaultSets: 3,
    description: 'Full-body high-intensity exercise',
    muscleGroups: ['full body'],
  },

  // Cardio exercises
  {
    name: 'Running',
    type: 'cardio',
    caloriesPerMinute: 10,
    description: 'Outdoor or treadmill running',
    muscleGroups: ['legs', 'cardiovascular'],
  },
  {
    name: 'Cycling',
    type: 'cardio',
    caloriesPerMinute: 8,
    description: 'Stationary bike or outdoor cycling',
    muscleGroups: ['legs', 'cardiovascular'],
  },
  {
    name: 'Jump Rope',
    type: 'cardio',
    caloriesPerMinute: 12,
    description: 'High-intensity cardio exercise',
    muscleGroups: ['legs', 'shoulders', 'cardiovascular'],
  },
  {
    name: 'Walking',
    type: 'cardio',
    caloriesPerMinute: 4,
    description: 'Low-impact cardiovascular exercise',
    muscleGroups: ['legs', 'cardiovascular'],
  },

  // Freeweight exercises
  {
    name: 'Bench Press',
    type: 'freeweight',
    caloriesPerRep: 1.0,
    defaultReps: 10,
    defaultSets: 3,
    description: 'Chest exercise using barbell or dumbbells',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
  },
  {
    name: 'Deadlift',
    type: 'freeweight',
    caloriesPerRep: 1.5,
    defaultReps: 8,
    defaultSets: 3,
    description: 'Full-body compound movement',
    muscleGroups: ['hamstrings', 'glutes', 'back', 'core'],
  },
  {
    name: 'Barbell Squat',
    type: 'freeweight',
    caloriesPerRep: 1.2,
    defaultReps: 10,
    defaultSets: 3,
    description: 'Weighted squat exercise',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
  },
  {
    name: 'Overhead Press',
    type: 'freeweight',
    caloriesPerRep: 0.8,
    defaultReps: 10,
    defaultSets: 3,
    description: 'Shoulder and tricep exercise',
    muscleGroups: ['shoulders', 'triceps', 'core'],
  },
  {
    name: 'Bicep Curls',
    type: 'freeweight',
    caloriesPerRep: 0.4,
    defaultReps: 12,
    defaultSets: 3,
    description: 'Isolated bicep exercise',
    muscleGroups: ['biceps'],
  },

  // Machine exercises
  {
    name: 'Lat Pulldown',
    type: 'machine',
    caloriesPerRep: 0.7,
    defaultReps: 12,
    defaultSets: 3,
    description: 'Back exercise using cable machine',
    muscleGroups: ['lats', 'biceps'],
  },
  {
    name: 'Leg Press',
    type: 'machine',
    caloriesPerRep: 1.0,
    defaultReps: 15,
    defaultSets: 3,
    description: 'Lower body exercise using leg press machine',
    muscleGroups: ['quadriceps', 'glutes'],
  },
  {
    name: 'Chest Fly',
    type: 'machine',
    caloriesPerRep: 0.6,
    defaultReps: 12,
    defaultSets: 3,
    description: 'Chest isolation exercise',
    muscleGroups: ['chest'],
  },
  {
    name: 'Cable Row',
    type: 'machine',
    caloriesPerRep: 0.8,
    defaultReps: 12,
    defaultSets: 3,
    description: 'Back exercise using cable machine',
    muscleGroups: ['back', 'biceps'],
  },
];

export async function seedExercises() {
  try {
    await connectToDatabase();
    
    // Check if exercises already exist
    const existingCount = await Exercise.countDocuments();
    if (existingCount > 0) {
      console.log('Exercises already seeded');
      return;
    }

    // Insert exercise data
    await Exercise.insertMany(exerciseData);
    console.log(`Seeded ${exerciseData.length} exercises successfully`);
  } catch (error) {
    console.error('Error seeding exercises:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedExercises().then(() => process.exit(0));
}

