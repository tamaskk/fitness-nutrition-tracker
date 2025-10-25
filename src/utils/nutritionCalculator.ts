/**
 * Nutrition Calculator Utilities
 * Helper functions for calculating nutrition values from barcode products
 */

export interface NutritionPer100g {
  energyKcal: number;
  proteins: number;
  carbohydrates: number;
  sugars: number;
  fat: number;
  saturatedFat: number;
  fiber: number;
}

export interface CalculatedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  sugars: number;
  fat: number;
  saturatedFat: number;
  fiber: number;
}

/**
 * Calculate nutrition for a specific amount
 * All nutrition data from Open Food Facts is per 100g
 * 
 * @param nutritionPer100g - Nutrition data from API (per 100g)
 * @param amountGrams - Actual amount consumed in grams
 * @returns Nutrition for the specified amount
 * 
 * @example
 * const bounty = {
 *   energyKcal: 487,
 *   proteins: 3.8,
 *   carbohydrates: 60,
 *   sugars: 48,
 *   fat: 26,
 *   saturatedFat: 21,
 *   fiber: 0
 * };
 * 
 * const oneServing = calculateNutritionForAmount(bounty, 57);
 * // Returns: { calories: 278, protein: 2.2, carbs: 34.2, ... }
 */
export const calculateNutritionForAmount = (
  nutritionPer100g: NutritionPer100g,
  amountGrams: number
): CalculatedNutrition => {
  const factor = amountGrams / 100;

  return {
    calories: Math.round(nutritionPer100g.energyKcal * factor),
    protein: Math.round(nutritionPer100g.proteins * factor * 10) / 10,
    carbs: Math.round(nutritionPer100g.carbohydrates * factor * 10) / 10,
    sugars: Math.round(nutritionPer100g.sugars * factor * 10) / 10,
    fat: Math.round(nutritionPer100g.fat * factor * 10) / 10,
    saturatedFat: Math.round(nutritionPer100g.saturatedFat * factor * 10) / 10,
    fiber: Math.round(nutritionPer100g.fiber * factor * 10) / 10,
  };
};

/**
 * Calculate nutrition for multiple servings
 * 
 * @param nutritionPer100g - Nutrition data from API
 * @param servingGrams - Single serving size in grams
 * @param numberOfServings - How many servings (can be decimal)
 * @returns Nutrition for specified number of servings
 * 
 * @example
 * calculateServingNutrition(bounty, 57, 1.5)
 * // Returns nutrition for 1.5 servings (85.5g)
 */
export const calculateServingNutrition = (
  nutritionPer100g: NutritionPer100g,
  servingGrams: number,
  numberOfServings: number
): CalculatedNutrition => {
  const totalGrams = servingGrams * numberOfServings;
  return calculateNutritionForAmount(nutritionPer100g, totalGrams);
};

/**
 * Check if product has high sugar content
 * WHO recommends <10% of daily calories from free sugars
 * For 2000 kcal diet: <50g sugar per day
 * 
 * @param sugarsPerServing - Grams of sugar in the serving
 * @returns Object with warning status and message
 */
export const checkSugarContent = (sugarsPerServing: number) => {
  if (sugarsPerServing > 20) {
    return {
      level: 'high',
      warning: true,
      message: `Very high in sugar (${sugarsPerServing}g)`,
      color: 'red'
    };
  } else if (sugarsPerServing > 10) {
    return {
      level: 'medium',
      warning: true,
      message: `Moderate sugar content (${sugarsPerServing}g)`,
      color: 'orange'
    };
  } else if (sugarsPerServing > 5) {
    return {
      level: 'low',
      warning: false,
      message: `Low sugar (${sugarsPerServing}g)`,
      color: 'yellow'
    };
  }
  return {
    level: 'very-low',
    warning: false,
    message: `Very low sugar (${sugarsPerServing}g)`,
    color: 'green'
  };
};

/**
 * Check if product has high saturated fat content
 * WHO recommends <10% of daily calories from saturated fat
 * For 2000 kcal diet: <22g saturated fat per day
 * 
 * @param saturatedFatPerServing - Grams of saturated fat
 * @returns Object with warning status and message
 */
export const checkSaturatedFatContent = (saturatedFatPerServing: number) => {
  if (saturatedFatPerServing > 10) {
    return {
      level: 'high',
      warning: true,
      message: `Very high in saturated fat (${saturatedFatPerServing}g)`,
      color: 'red'
    };
  } else if (saturatedFatPerServing > 5) {
    return {
      level: 'medium',
      warning: true,
      message: `Moderate saturated fat (${saturatedFatPerServing}g)`,
      color: 'orange'
    };
  } else if (saturatedFatPerServing > 2) {
    return {
      level: 'low',
      warning: false,
      message: `Low saturated fat (${saturatedFatPerServing}g)`,
      color: 'yellow'
    };
  }
  return {
    level: 'very-low',
    warning: false,
    message: `Very low saturated fat (${saturatedFatPerServing}g)`,
    color: 'green'
  };
};

/**
 * Get overall health score for a food item
 * Based on sugar, saturated fat, fiber, and protein content
 * 
 * @param nutrition - Calculated nutrition for actual amount
 * @returns Score from 1-10 (10 = healthiest)
 */
export const getHealthScore = (nutrition: CalculatedNutrition): number => {
  let score = 10;

  // Penalize high sugar (up to -3 points)
  if (nutrition.sugars > 20) score -= 3;
  else if (nutrition.sugars > 10) score -= 2;
  else if (nutrition.sugars > 5) score -= 1;

  // Penalize high saturated fat (up to -3 points)
  if (nutrition.saturatedFat > 10) score -= 3;
  else if (nutrition.saturatedFat > 5) score -= 2;
  else if (nutrition.saturatedFat > 2) score -= 1;

  // Reward high protein (up to +2 points)
  if (nutrition.protein > 20) score += 2;
  else if (nutrition.protein > 10) score += 1;

  // Reward high fiber (up to +2 points)
  if (nutrition.fiber > 5) score += 2;
  else if (nutrition.fiber > 3) score += 1;

  // Keep score between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Format macro percentage of daily value
 * Based on 2000 kcal diet recommendations
 * 
 * @param macroType - Type of macro (protein, carbs, fat)
 * @param grams - Amount in grams
 * @returns Percentage of daily recommended value
 */
export const calculateDailyValuePercentage = (
  macroType: 'protein' | 'carbs' | 'fat' | 'saturatedFat' | 'fiber' | 'sugar',
  grams: number
): number => {
  const dailyValues = {
    protein: 50,        // 50g recommended
    carbs: 300,         // 300g recommended
    fat: 70,            // 70g recommended
    saturatedFat: 20,   // 20g max recommended
    fiber: 25,          // 25g recommended
    sugar: 50,          // 50g max recommended
  };

  const dailyValue = dailyValues[macroType];
  return Math.round((grams / dailyValue) * 100);
};

/**
 * Sum nutrition from multiple food items
 * Useful for calculating daily totals
 * 
 * @param foods - Array of calculated nutrition objects
 * @returns Total nutrition
 */
export const sumNutrition = (
  foods: CalculatedNutrition[]
): CalculatedNutrition => {
  return foods.reduce(
    (total, food) => ({
      calories: total.calories + food.calories,
      protein: Math.round((total.protein + food.protein) * 10) / 10,
      carbs: Math.round((total.carbs + food.carbs) * 10) / 10,
      sugars: Math.round((total.sugars + food.sugars) * 10) / 10,
      fat: Math.round((total.fat + food.fat) * 10) / 10,
      saturatedFat: Math.round((total.saturatedFat + food.saturatedFat) * 10) / 10,
      fiber: Math.round((total.fiber + food.fiber) * 10) / 10,
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      sugars: 0,
      fat: 0,
      saturatedFat: 0,
      fiber: 0,
    }
  );
};

/**
 * Get all health warnings for a food item
 * 
 * @param nutrition - Calculated nutrition
 * @returns Array of warning messages
 */
export const getHealthWarnings = (nutrition: CalculatedNutrition): string[] => {
  const warnings: string[] = [];

  const sugarCheck = checkSugarContent(nutrition.sugars);
  if (sugarCheck.warning) {
    warnings.push(sugarCheck.message);
  }

  const fatCheck = checkSaturatedFatContent(nutrition.saturatedFat);
  if (fatCheck.warning) {
    warnings.push(fatCheck.message);
  }

  if (nutrition.calories > 500) {
    warnings.push(`High calorie content (${nutrition.calories} kcal)`);
  }

  if (nutrition.fiber === 0 && nutrition.carbs > 20) {
    warnings.push('No fiber - highly processed carbs');
  }

  return warnings;
};

/**
 * Format nutrition display text
 * 
 * @param value - Numeric value
 * @param unit - Unit (g, kcal, etc.)
 * @returns Formatted string
 */
export const formatNutritionValue = (value: number, unit: string = 'g'): string => {
  if (unit === 'g') {
    return `${value}${unit}`;
  }
  return `${value} ${unit}`;
};


