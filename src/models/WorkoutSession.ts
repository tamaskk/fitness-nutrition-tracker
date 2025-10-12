import mongoose, { Schema, Document } from 'mongoose';

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight?: number;
  duration?: number;
  completed: boolean;
  restTime?: number;
  notes?: string;
}

export interface CompletedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: CompletedSet[];
  totalSets: number;
  completedSets: number;
}

export interface WorkoutSessionDocument extends Document {
  userId: string;
  workoutId: string;
  workoutName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  exercises: CompletedExercise[];
  totalCaloriesBurned?: number;
  notes?: string;
  status: 'processing' | 'in-progress' | 'paused' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const CompletedSetSchema = new Schema({
  setNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  reps: {
    type: Number,
    required: true,
    min: 0,
  },
  weight: {
    type: Number,
    min: 0,
  },
  duration: {
    type: Number,
    min: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  restTime: {
    type: Number,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const CompletedExerciseSchema = new Schema({
  exerciseId: {
    type: String,
    required: true,
  },
  exerciseName: {
    type: String,
    required: true,
    trim: true,
  },
  sets: [CompletedSetSchema],
  totalSets: {
    type: Number,
    required: true,
    min: 1,
  },
  completedSets: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

const WorkoutSessionSchema = new Schema<WorkoutSessionDocument>({
  userId: {
    type: String,
    required: true,
  },
  workoutId: {
    type: String,
    required: true,
  },
  workoutName: {
    type: String,
    required: true,
    trim: true,
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
    min: 0,
  },
  exercises: [CompletedExerciseSchema],
  totalCaloriesBurned: {
    type: Number,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['processing', 'in-progress', 'paused', 'completed', 'failed'],
    default: 'processing',
  },
}, {
  timestamps: true,
});

// Index for search functionality
WorkoutSessionSchema.index({ userId: 1, startTime: -1 });

// Clear any existing model to ensure fresh schema
if (mongoose.models.WorkoutSession) {
  delete mongoose.models.WorkoutSession;
}

export default mongoose.model<WorkoutSessionDocument>('WorkoutSession', WorkoutSessionSchema);
