// User
export interface User {
  _id: string;
  email: string;
  name?: string;
  passwordHash: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weightKg?: number;
  heightCm?: number;
  dailyCalorieGoal?: number;
  createdAt: Date;
}

// Food Item
export interface FoodItem {
  _id?: string;
  externalId?: string;
  name: string;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  servingSize?: string;
  barcode?: string;
  createdByUser?: boolean;
}

// Meal Entry
export interface MealEntry {
  _id?: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
  foodId?: string;
  name: string;
  quantityGrams?: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt?: Date;
}

// Recipe
export interface Recipe {
  _id?: string;
  userId: string;
  externalId?: string;
  title: string;
  ingredients: { name: string; quantity?: string; grams?: number }[];
  steps?: string[];
  caloriesPerServing?: number;
  servings?: number;
  tags?: string[];
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink';
}

// Exercise
export interface Exercise {
  _id?: string;
  name: string;
  type: 'bodyweight' | 'machine' | 'cardio' | 'freeweight';
  caloriesPerRep?: number;
  caloriesPerMinute?: number;
  defaultReps?: number;
  defaultSets?: number;
  description?: string;
  muscleGroups?: string[];
}

// Workout Entry
export interface WorkoutEntry {
  _id?: string;
  userId: string;
  date: string;
  exercises: {
    exerciseId?: string;
    name: string;
    sets: number;
    reps?: number;
    durationSeconds?: number;
    weightKg?: number;
    caloriesBurned: number;
  }[];
  totalCalories: number;
  notes?: string;
  createdAt?: Date;
}

// Shopping List Item
export interface ShoppingListItem {
  _id?: string;
  userId: string;
  name: string;
  quantity?: string;
  category?: string;
  purchased: boolean;
  addedAt: Date;
  extraInfo?: string;
}

// Daily Summary
export interface DailySummary {
  date: string;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  calorieGoal: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  mealsCount: number;
  workoutsCount: number;
}

// API Response Types
export interface NutritionAPIResponse {
  foods: {
    food_name: string;
    nf_calories: number;
    nf_total_fat: number;
    nf_total_carbohydrate: number;
    nf_protein: number;
    serving_weight_grams: number;
  }[];
}

export interface RecipeAPIResponse {
  hits: {
    recipe: {
      uri: string;
      label: string;
      image: string;
      ingredients: {
        text: string;
        quantity: number;
        measure: string;
        food: string;
        weight: number;
      }[];
      calories: number;
      yield: number;
      totalTime: number;
      cuisineType: string[];
      mealType: string[];
    };
  }[];
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface ProfileFormData {
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weightKg?: number;
  heightCm?: number;
  dailyCalorieGoal?: number;
}

// Expense
export interface Expense {
  _id?: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  billImageUrl?: string;
  extractedItems?: {
    name: string;
    price: number;
    quantity?: number;
  }[];
  billItems?: {
    name: string;
    price: number;
    quantity?: number;
  }[];
  isBill?: boolean;
  location?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  createdAt?: Date;
  updatedAt?: Date;
}

// Income
export interface Income {
  _id?: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  source?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MealFormData {
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
  quantityGrams: number;
  calories: number;
}

export interface WorkoutFormData {
  exercises: {
    name: string;
    sets: number;
    reps?: number;
    durationSeconds?: number;
    weightKg?: number;
  }[];
}

