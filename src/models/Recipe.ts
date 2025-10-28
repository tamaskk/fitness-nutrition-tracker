import mongoose, { Schema, Document } from 'mongoose';
import { Recipe } from '@/types';

export interface RecipeDocument extends Omit<Recipe, '_id'>, Document {}

const RecipeSchema = new Schema({
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
    step: {
      type: String,
      required: true,
      trim: true,
    },
    ingredient: {
      type: String,
      required: false, // Optional for backwards compatibility
      trim: true,
      default: '',
    },
  }],
  caloriesPerServing: {
    type: Number,
    min: 0,
  },
  proteinPerServing: {
    type: Number,
    min: 0,
    default: 0,
  },
  carbsPerServing: {
    type: Number,
    min: 0,
    default: 0,
  },
  fatPerServing: {
    type: Number,
    min: 0,
    default: 0,
  },
  fiberPerServing: {
    type: Number,
    min: 0,
    default: 0,
  },
  macroNutrients: {
    protein: { type: Number, min: 0, default: 0 },
    carbs: { type: Number, min: 0, default: 0 },
    fat: { type: Number, min: 0, default: 0 },
    fiber: { type: Number, min: 0, default: 0 },
  },
  microNutrients: {
    vitaminA: { type: Number, min: 0 },
    vitaminC: { type: Number, min: 0 },
    vitaminD: { type: Number, min: 0 },
    calcium: { type: Number, min: 0 },
    iron: { type: Number, min: 0 },
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
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink', 'reggeli', 'ebéd', 'vacsora', 'uzsonna', 'desszert', 'ital'],
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

