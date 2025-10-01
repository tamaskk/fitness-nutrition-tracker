import mongoose, { Schema, Document } from 'mongoose';
import { Recipe } from '@/types';

export interface RecipeDocument extends Omit<Recipe, '_id'>, Document {}

const RecipeSchema = new Schema<RecipeDocument>({
  userId: {
    type: String,
    required: true,
  },
  externalId: {
    type: String,
    sparse: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      trim: true,
    },
    grams: {
      type: Number,
      min: 0,
    },
  }],
  steps: [{
    type: String,
    trim: true,
  }],
  caloriesPerServing: {
    type: Number,
    min: 0,
  },
  servings: {
    type: Number,
    min: 1,
    default: 1,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  imageUrl: {
    type: String,
    trim: true,
  },
  prepTime: {
    type: Number,
    min: 0,
  },
  cookTime: {
    type: Number,
    min: 0,
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'],
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for search functionality
RecipeSchema.index({ title: 'text', tags: 'text', 'ingredients.name': 'text' });

// Clear any existing model to ensure fresh schema
if (mongoose.models.Recipe) {
  delete mongoose.models.Recipe;
}

export default mongoose.model<RecipeDocument>('Recipe', RecipeSchema);

