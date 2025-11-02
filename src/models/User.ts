import mongoose, { Schema, Document } from 'mongoose';
import { User } from '@/types';

// Force clear the model cache before defining the schema
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export interface UserDocument extends Omit<User, '_id'>, Document {}

const UserSchema = new Schema({
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
    // 🆕 NEW: Add these three preferences for notifications
    marketing: { type: Boolean, default: false },
    tips: { type: Boolean, default: true },
    updates: { type: Boolean, default: true },
  },
  // Onboarding answers: Direct array of question objects (no _id for subdocuments)
  onboardingAnswers: [{
    id: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    _id: false, // Disable automatic _id generation for subdocuments
  }],
  // 🆕 NEW: Track when user completed the new onboarding questionnaire
  onboardingCompletedAt: {
    type: Date,
    default: null,
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
  goal: {
    goalType: {
      type: String,
      enum: ['lose_weight', 'gain_weight', 'build_muscle', 'maintain_weight', 'improve_fitness', 'tone_body'],
      default: 'maintain_weight',
    },
    targetWeight: {
      type: Number,
      min: 1,
      max: 1000,
    },
    durationDays: {
      type: Number,
      min: 1,
      max: 1825, // Up to 5 years
    },
    // AI-generated plan details
    plan: {
      maintenanceCalories: { type: Number },
      goalCaloriesStart: { type: Number },
      goalCaloriesEnd: { type: Number },
      averageDailyDeficitOrSurplusKcal: { type: Number },
      expectedTotalWeightChangeKg: { type: Number },
      targetWeightKg: { type: Number },
      calorieSchedule: [{
        period: { type: String },
        caloriesToConsume: { type: Number },
        caloriesToBurn: { type: Number },
        netCalories: { type: Number },
        averageWeeklyWeightChangeKg: { type: Number },
        startDate: { type: Date },
        endDate: { type: Date },
      }],
      progressMilestones: [{
        period: { type: String },
        targetWeightKg: { type: Number },
        startDate: { type: Date },
        endDate: { type: Date },
      }],
      notes: [{ type: String }],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  stravaConnection: {
    accessToken: { type: String },
    refreshToken: { type: String },
    athleteId: { type: String },
    username: { type: String },
    connectedAt: { type: Date },
    lastSyncedAt: { type: Date },
  },
  googleFitConnection: {
    accessToken: { type: String },
    refreshToken: { type: String },
    scope: { type: String },
    tokenType: { type: String },
    expiryDate: { type: Date },
    googleUserId: { type: String },
    connectedAt: { type: Date },
    lastSyncedAt: { type: Date },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

// Clear the model cache to ensure schema changes are applied
delete mongoose.models.User;

export default mongoose.model<UserDocument>('User', UserSchema);

