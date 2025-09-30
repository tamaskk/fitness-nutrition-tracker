import mongoose, { Schema, Document } from 'mongoose';
import { WorkoutEntry } from '@/types';

export interface WorkoutEntryDocument extends Omit<WorkoutEntry, '_id'>, Document {}

const WorkoutEntrySchema = new Schema<WorkoutEntryDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
  },
  exercises: [{
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
    },
    name: {
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
      min: 0,
    },
    durationSeconds: {
      type: Number,
      min: 0,
    },
    weightKg: {
      type: Number,
      min: 0,
    },
    caloriesBurned: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  totalCalories: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
WorkoutEntrySchema.index({ userId: 1, date: 1 });

export default mongoose.models.WorkoutEntry || mongoose.model<WorkoutEntryDocument>('WorkoutEntry', WorkoutEntrySchema);

