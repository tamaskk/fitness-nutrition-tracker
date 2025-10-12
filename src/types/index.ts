// User
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string; // TCountryCode from countries-list
  language: 'en' | 'de' | 'fr' | 'nl' | 'hu' | 'es' | 'pt';
  passwordHash: string;
  preferences: {
    mealPlans: boolean;
    recipes: boolean;
    trainings: boolean;
    shoppingList: boolean;
    priceMonitor: boolean;
    finance: boolean;
  };
  onboardingAnswers: {
    mealPlans: {
      goal?: string;
      cookingTime?: string;
      dietaryRestrictions?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
    recipes: {
      recipeType?: string;
      cookingFrequency?: string;
      priority?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
    trainings: {
      fitnessGoal?: string;
      trainingLocation?: string;
      trainingFrequency?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
    shoppingList: {
      planningStyle?: string;
      shoppingPriority?: string;
      shoppingFrequency?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
    priceMonitor: {
      productsToTrack?: string;
      priceComparisonPriority?: string;
      priceCheckFrequency?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
    finance: {
      financialGoal?: string;
      currentManagement?: string;
      toolImportance?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
  };
  birthday: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  weight?: {
    value?: number;
    unit?: 'kg' | 'lbs';
  };
  height?: {
    value?: number;
    unit?: 'cm' | 'ft';
  };
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
  preferredStore?: string;
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
  adminPassword?: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  country: string; // TCountryCode from countries-list
  language: 'en' | 'de' | 'fr' | 'nl' | 'hu' | 'es' | 'pt';
  birthday: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  weight?: {
    value?: number;
    unit?: 'kg' | 'lbs';
  };
  height?: {
    value?: number;
    unit?: 'cm' | 'ft';
  };
}

export interface PreferencesFormData {
  mealPlans: boolean;
  recipes: boolean;
  trainings: boolean;
  shoppingList: boolean;
  priceMonitor: boolean;
  finance: boolean;
}

export interface OnboardingAnswersFormData {
  mealPlans: {
    goal: string;
    cookingTime: string;
    dietaryRestrictions: string;
    notifications: 'email' | 'in-app' | 'both' | 'none';
  };
  recipes: {
    recipeType: string;
    cookingFrequency: string;
    priority: string;
    notifications: 'email' | 'in-app' | 'both' | 'none';
  };
  trainings: {
    fitnessGoal: string;
    trainingLocation: string;
    trainingFrequency: string;
    notifications: 'email' | 'in-app' | 'both' | 'none';
  };
  shoppingList: {
    planningStyle: string;
    shoppingPriority: string;
    shoppingFrequency: string;
    notifications: 'email' | 'in-app' | 'both' | 'none';
  };
  priceMonitor: {
    productsToTrack: string;
    priceComparisonPriority: string;
    priceCheckFrequency: string;
    notifications: 'email' | 'in-app' | 'both' | 'none';
  };
  finance: {
    financialGoal: string;
    currentManagement: string;
    toolImportance: string;
    notifications: 'email' | 'in-app' | 'both' | 'none';
  };
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

// Admin Types
export interface AdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  language: 'en' | 'de' | 'fr' | 'nl' | 'hu' | 'es' | 'pt';
  preferences: {
    mealPlans: boolean;
    recipes: boolean;
    trainings: boolean;
    shoppingList: boolean;
    priceMonitor: boolean;
    finance: boolean;
  };
  birthday: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  weight?: {
    value?: number;
    unit?: 'kg' | 'lbs';
  };
  height?: {
    value?: number;
    unit?: 'cm' | 'ft';
  };
  dailyCalorieGoal?: number;
  createdAt: Date;
}

export interface AdminStats {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsersThisWeek: number;
  averageAge?: number;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
}

export interface AdminLoginFormData {
  email: string;
  password: string;
}

// Notification Types
export interface Chat {
  _id: string;
  participants: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  messages: {
    _id: string;
    senderId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    content: string;
    timestamp: string;
    readBy: string[];
  }[];
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  sentBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  readAt?: string;
}

export interface Update {
  _id: string;
  title: string;
  content: string;
  type: 'feature' | 'bugfix' | 'maintenance' | 'announcement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  sentBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  readAt?: string;
}

