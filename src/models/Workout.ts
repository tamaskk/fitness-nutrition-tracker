import mongoose, { Schema, Document } from 'mongoose';

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // for cardio exercises
  restTime?: number; // rest between sets in seconds
  notes?: string;
}

export interface WorkoutDocument extends Document {
  userId: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isTemplate: boolean; // true for reusable templates, false for completed workouts
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutExerciseSchema = new Schema({
  exerciseId: {
    type: String,
    required: true,
  },
  exerciseName: {
    type: String,
    required: true,
    trim: true,
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
  },
  reps: {
    type: Number,
    required: true,
    min: 1,
  },
  weight: {
    type: Number,
    min: 0,
  },
  duration: {
    type: Number,
    min: 0,
  },
  restTime: {
    type: Number,
    min: 0,
    default: 60, // 60 seconds default rest
  },
  notes: {
    type: String,
    trim: true,
  },
});

const WorkoutSchema = new Schema<WorkoutDocument>({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  exercises: [WorkoutExerciseSchema],
  estimatedDuration: {
    type: Number,
    required: true,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  isTemplate: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for search functionality
WorkoutSchema.index({ userId: 1, name: 'text' });

// Clear any existing model to ensure fresh schema
if (mongoose.models.Workout) {
  delete mongoose.models.Workout;
}

export default mongoose.model<WorkoutDocument>('Workout', WorkoutSchema);

