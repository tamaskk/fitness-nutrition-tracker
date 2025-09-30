import mongoose, { Schema, Document } from 'mongoose';
import { Exercise } from '@/types';

export interface ExerciseDocument extends Omit<Exercise, '_id'>, Document {}

const ExerciseSchema = new Schema<ExerciseDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['bodyweight', 'machine', 'cardio', 'freeweight'],
  },
  caloriesPerRep: {
    type: Number,
    min: 0,
  },
  caloriesPerMinute: {
    type: Number,
    min: 0,
  },
  defaultReps: {
    type: Number,
    min: 1,
  },
  defaultSets: {
    type: Number,
    min: 1,
  },
  description: {
    type: String,
    trim: true,
  },
  muscleGroups: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
}, {
  timestamps: true,
});

// Index for search functionality
ExerciseSchema.index({ name: 'text', muscleGroups: 'text' });
ExerciseSchema.index({ type: 1 });

export default mongoose.models.Exercise || mongoose.model<ExerciseDocument>('Exercise', ExerciseSchema);

