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
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    required: true,
    default: 'en',
    enum: ['en', 'de', 'fr', 'nl', 'hu', 'es', 'pt'],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  preferences: {
    mealPlans: { type: Boolean, default: false },
    recipes: { type: Boolean, default: false },
    trainings: { type: Boolean, default: false },
    shoppingList: { type: Boolean, default: false },
    priceMonitor: { type: Boolean, default: false },
    finance: { type: Boolean, default: false },
  },
  onboardingAnswers: {
    mealPlans: {
      goal: { type: String },
      cookingTime: { type: String },
      dietaryRestrictions: { type: String },
      notifications: { type: String, enum: ['email', 'in-app', 'both', 'none'], default: 'none' },
    },
    recipes: {
      recipeType: { type: String },
      cookingFrequency: { type: String },
      priority: { type: String },
      notifications: { type: String, enum: ['email', 'in-app', 'both', 'none'], default: 'none' },
    },
    trainings: {
      fitnessGoal: { type: String },
      trainingLocation: { type: String },
      trainingFrequency: { type: String },
      notifications: { type: String, enum: ['email', 'in-app', 'both', 'none'], default: 'none' },
    },
    shoppingList: {
      planningStyle: { type: String },
      shoppingPriority: { type: String },
      shoppingFrequency: { type: String },
      notifications: { type: String, enum: ['email', 'in-app', 'both', 'none'], default: 'none' },
    },
    priceMonitor: {
      productsToTrack: { type: String },
      priceComparisonPriority: { type: String },
      priceCheckFrequency: { type: String },
      notifications: { type: String, enum: ['email', 'in-app', 'both', 'none'], default: 'none' },
    },
    finance: {
      financialGoal: { type: String },
      currentManagement: { type: String },
      toolImportance: { type: String },
      notifications: { type: String, enum: ['email', 'in-app', 'both', 'none'], default: 'none' },
    },
  },
  birthday: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
  },
  weight: {
    value: {
      type: Number,
      min: 1,
      max: 1000,
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg',
    },
  },
  height: {
    value: {
      type: Number,
      min: 1,
      max: 300,
    },
    unit: {
      type: String,
      enum: ['cm', 'ft'],
      default: 'cm',
    },
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

// Clear the model cache to ensure schema changes are applied
delete mongoose.models.User;

export default mongoose.model<UserDocument>('User', UserSchema);

