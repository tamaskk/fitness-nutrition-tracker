import mongoose, { Schema, Document } from 'mongoose';

export interface IMeal {
  recipeId: mongoose.Types.ObjectId | string;
  recipeTitle?: string; // Store title for context (avoids needing to populate)
  recipe?: any; // Populated recipe data
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack';
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface IDay {
  dayNumber: number; // 1, 2, 3, etc.
  date: Date;
  meals: IMeal[];
}

export interface IMealPlanPreferences {
  dislikes: string[]; // Foods/ingredients user doesn't like
  excludedIngredients: string[]; // Ingredients to avoid
  allergies?: string[];
  dietaryRestrictions?: string[]; // vegetarian, vegan, gluten-free, etc.
  calorieTarget?: number;
  proteinTarget?: number;
}

export interface MealPlanDocument extends Document {
  userId: string;
  name: string;
  description?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: Date;
  endDate?: Date;
  days: IDay[];
  preferences: IMealPlanPreferences;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MealSchema = new Schema<IMeal>({
  recipeId: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  recipeTitle: {
    type: String,
    trim: true,
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'],
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { _id: false });

const DaySchema = new Schema<IDay>({
  dayNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  date: {
    type: Date,
    required: true,
  },
  meals: [MealSchema],
}, { _id: false });

const PreferencesSchema = new Schema<IMealPlanPreferences>({
  dislikes: [{
    type: String,
    trim: true,
  }],
  excludedIngredients: [{
    type: String,
    trim: true,
  }],
  allergies: [{
    type: String,
    trim: true,
  }],
  dietaryRestrictions: [{
    type: String,
    trim: true,
  }],
  calorieTarget: {
    type: Number,
    min: 0,
  },
  proteinTarget: {
    type: Number,
    min: 0,
  },
}, { _id: false });

const MealPlanSchema = new Schema<MealPlanDocument>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: true,
    default: 'weekly',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  days: [DaySchema],
  preferences: {
    type: PreferencesSchema,
    default: () => ({}),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for querying
MealPlanSchema.index({ userId: 1, startDate: -1 });
MealPlanSchema.index({ userId: 1, isActive: 1 });

// Clear any existing model to ensure fresh schema
if (mongoose.models.MealPlan) {
  delete mongoose.models.MealPlan;
}

export default mongoose.model<MealPlanDocument>('MealPlan', MealPlanSchema);

