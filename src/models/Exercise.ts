import mongoose, { Schema, Document } from 'mongoose';

export interface ExerciseDocument extends Document {
  userId: string;
  name: string;
  category: string;
  muscleGroups: string[];
  description?: string;
  instructions?: string[];
  equipment?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reps?: number;
  sets?: number;
  weight?: number;
  rest?: number;
  createdAt: Date;
  updatedAt: Date;
  image?: string
}

const ExerciseSchema = new Schema<ExerciseDocument>({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: false,
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'other'],
    trim: true,
  },
  muscleGroups: [{
    type: String,
    enum: ['chest', 'back', 'shoulders', 'arms', 'biceps', 'triceps', 'legs', 'core', 'glutes', 'full-body', 'other'],
    trim: true,
  }],
  description: {
    type: String,
    trim: true,
  },
  instructions: [{
    type: String,
    trim: true,
  }],
  equipment: {
    type: String,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  reps: {
    type: Number,
    min: 1,
    default: 10,
  },
  sets: {
    type: Number,
    min: 1,
    default: 3,
  },
  weight: {
    type: Number,
    min: 0,
    default: 0,
  },
  image: {
    type: String,
    required: true,
  },
  rest: {
    type: Number,
    min: 0,
    default: 60,
  },
}, {
  timestamps: true,
});

// Index for search functionality
ExerciseSchema.index({ userId: 1, name: 'text' });

// Clear any existing model to ensure fresh schema
if (mongoose.models.Exercise) {
  delete mongoose.models.Exercise;
}

export default mongoose.model<ExerciseDocument>('Exercise', ExerciseSchema);