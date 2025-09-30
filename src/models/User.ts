import mongoose, { Schema, Document } from 'mongoose';
import { User } from '@/types';

export interface UserDocument extends Omit<User, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    min: 1,
    max: 120,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  weightKg: {
    type: Number,
    min: 1,
    max: 1000,
  },
  heightCm: {
    type: Number,
    min: 1,
    max: 300,
  },
  dailyCalorieGoal: {
    type: Number,
    min: 500,
    max: 10000,
    default: 2000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

