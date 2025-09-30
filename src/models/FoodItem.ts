import mongoose, { Schema, Document } from 'mongoose';
import { FoodItem } from '@/types';

export interface FoodItemDocument extends Omit<FoodItem, '_id'>, Document {}

const FoodItemSchema = new Schema<FoodItemDocument>({
  externalId: {
    type: String,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  caloriesPer100g: {
    type: Number,
    min: 0,
  },
  proteinPer100g: {
    type: Number,
    min: 0,
  },
  carbsPer100g: {
    type: Number,
    min: 0,
  },
  fatPer100g: {
    type: Number,
    min: 0,
  },
  servingSize: {
    type: String,
    trim: true,
  },
  barcode: {
    type: String,
    sparse: true,
  },
  createdByUser: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for search functionality
FoodItemSchema.index({ name: 'text' });

export default mongoose.models.FoodItem || mongoose.model<FoodItemDocument>('FoodItem', FoodItemSchema);

