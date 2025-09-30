import mongoose, { Schema, Document } from 'mongoose';
import { MealEntry } from '@/types';

export interface MealEntryDocument extends Omit<MealEntry, '_id'>, Document {}

const MealEntrySchema = new Schema<MealEntryDocument>({
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
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'drink'],
  },
  foodId: {
    type: Schema.Types.ObjectId,
    ref: 'FoodItem',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantityGrams: {
    type: Number,
    min: 0,
  },
  calories: {
    type: Number,
    required: true,
    min: 0,
  },
  protein: {
    type: Number,
    min: 0,
    default: 0,
  },
  carbs: {
    type: Number,
    min: 0,
    default: 0,
  },
  fat: {
    type: Number,
    min: 0,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
MealEntrySchema.index({ userId: 1, date: 1 });
MealEntrySchema.index({ userId: 1, date: 1, mealType: 1 });

export default mongoose.models.MealEntry || mongoose.model<MealEntryDocument>('MealEntry', MealEntrySchema);

