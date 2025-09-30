// Calorie calculation for meals
export const calculateMealCalories = (caloriesPer100g: number, quantityGrams: number): number => {
  return Math.round((quantityGrams / 100) * caloriesPer100g);
};

// Macro calculation for meals
export const calculateMealMacros = (
  macrosPer100g: { protein: number; carbs: number; fat: number },
  quantityGrams: number
) => {
  const factor = quantityGrams / 100;
  return {
    protein: Math.round(macrosPer100g.protein * factor * 10) / 10,
    carbs: Math.round(macrosPer100g.carbs * factor * 10) / 10,
    fat: Math.round(macrosPer100g.fat * factor * 10) / 10,
  };
};

// Workout calorie calculations
export const calculateWorkoutCalories = (
  exercise: {
    type: 'bodyweight' | 'machine' | 'cardio' | 'freeweight';
    caloriesPerRep?: number;
    caloriesPerMinute?: number;
  },
  sets: number,
  reps?: number,
  durationSeconds?: number,
  weightKg?: number
): number => {
  let calories = 0;

  if (exercise.type === 'cardio' && exercise.caloriesPerMinute && durationSeconds) {
    calories = (durationSeconds / 60) * exercise.caloriesPerMinute;
  } else if (exercise.caloriesPerRep && reps) {
    calories = sets * reps * exercise.caloriesPerRep;
    
    // Add weight factor for freeweight exercises
    if (exercise.type === 'freeweight' && weightKg) {
      calories *= Math.max(1, weightKg / 50); // Scale based on weight (50kg baseline)
    }
  }

  return Math.round(calories);
};

// BMR calculation using Mifflin-St Jeor Equation
export const calculateBMR = (
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number => {
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  
  return Math.round(bmr);
};

// TDEE calculation (Total Daily Energy Expenditure)
export const calculateTDEE = (
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  return Math.round(bmr * multipliers[activityLevel]);
};

// Daily balance calculation
export const calculateDailyBalance = (
  caloriesConsumed: number,
  caloriesBurned: number,
  calorieGoal: number
) => {
  const netCalories = caloriesConsumed - caloriesBurned;
  const balance = netCalories - calorieGoal;
  
  return {
    netCalories,
    balance,
    isOverGoal: balance > 0,
    percentageOfGoal: Math.round((netCalories / calorieGoal) * 100),
  };
};

// Format calories for display
export const formatCalories = (calories: number): string => {
  return calories.toLocaleString();
};

// Format macros for display
export const formatMacros = (grams: number): string => {
  return `${grams.toFixed(1)}g`;
};

// Get meal type color for UI
export const getMealTypeColor = (mealType: string): string => {
  const colors = {
    breakfast: 'bg-orange-100 text-orange-800',
    lunch: 'bg-green-100 text-green-800',
    dinner: 'bg-blue-100 text-blue-800',
    snack: 'bg-purple-100 text-purple-800',
    drink: 'bg-cyan-100 text-cyan-800',
  };
  
  return colors[mealType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

// Get exercise type color for UI
export const getExerciseTypeColor = (exerciseType: string): string => {
  const colors = {
    bodyweight: 'bg-green-100 text-green-800',
    machine: 'bg-blue-100 text-blue-800',
    cardio: 'bg-red-100 text-red-800',
    freeweight: 'bg-purple-100 text-purple-800',
  };
  
  return colors[exerciseType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

