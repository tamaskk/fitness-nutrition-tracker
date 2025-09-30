// Frontend utility for calling TheMealDB API directly
export interface TheMealDBRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strArea: string;
  strCategory: string;
  [key: string]: string; // For dynamic ingredient/measure properties
}

export interface ConvertedRecipe {
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
  steps: string[];
  calories: number;
  yield: number;
  totalTime: number;
  cuisineType: string[];
  mealType: string[];
  tags: string[];
}

// Convert TheMealDB format to our app format
function convertMealToRecipe(meal: TheMealDBRecipe): ConvertedRecipe {
  // Extract ingredients from TheMealDB format
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    
    // Only add if ingredient exists, is not empty, and is not null
    if (ingredient && 
        ingredient !== null && 
        ingredient !== undefined && 
        ingredient.trim() !== '' && 
        ingredient.trim() !== 'null') {
      
      const cleanMeasure = measure && measure !== null && measure !== '' ? measure.trim() : '';
      const cleanIngredient = ingredient.trim();
      const fullText = `${cleanMeasure} ${cleanIngredient}`.trim();
      
      // Only add if we have meaningful content
      if (fullText.length > 2 && cleanIngredient.length > 0) {
        ingredients.push({
          text: fullText,
          name: cleanIngredient,
          quantity: cleanMeasure,
          measure: cleanMeasure,
          food: cleanIngredient,
          weight: 100,
        });
      }
    }
  }

  // Extract instructions as steps
  const instructions = meal.strInstructions || '';
  const steps = instructions
    .split(/\r\n|\r|\n/)
    .filter((step: string) => step.trim().length > 0)
    .map((step: string) => step.trim());

  return {
    uri: `themealdb-${meal.idMeal}`,
    label: meal.strMeal,
    image: meal.strMealThumb,
    ingredients,
    steps,
    calories: Math.floor(Math.random() * 300) + 200, // Random estimate 200-500
    yield: 4,
    totalTime: Math.floor(Math.random() * 60) + 15, // Random 15-75 minutes
    cuisineType: [meal.strArea?.toLowerCase() || 'international'],
    mealType: [meal.strCategory?.toLowerCase() || 'main'],
    tags: [meal.strArea, meal.strCategory].filter(Boolean).map(tag => tag.toLowerCase()),
  };
}

// Search recipes by name
export async function searchRecipesByName(query: string): Promise<ConvertedRecipe[]> {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.meals) {
      return data.meals.map(convertMealToRecipe);
    }
    return [];
  } catch (error) {
    console.error('Error searching recipes by name:', error);
    return [];
  }
}

// Search recipes by ingredient
export async function searchRecipesByIngredient(ingredient: string): Promise<ConvertedRecipe[]> {
  try {
    // First get the list of meals with this ingredient
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
    const data = await response.json();
    
    if (data.meals) {
      // Get full details for each meal (limit to 10 to avoid too many requests)
      const detailedMeals = [];
      for (const meal of data.meals.slice(0, 10)) {
        try {
          const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
          const detailData = await detailResponse.json();
          if (detailData.meals && detailData.meals[0]) {
            detailedMeals.push(detailData.meals[0]);
          }
        } catch (err) {
          console.error('Error fetching meal details:', err);
        }
      }
      return detailedMeals.map(convertMealToRecipe);
    }
    return [];
  } catch (error) {
    console.error('Error searching recipes by ingredient:', error);
    return [];
  }
}

// Search recipes by first letter (for single letter queries)
export async function searchRecipesByFirstLetter(letter: string): Promise<ConvertedRecipe[]> {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter.toLowerCase()}`);
    const data = await response.json();
    
    if (data.meals) {
      return data.meals.map(convertMealToRecipe);
    }
    return [];
  } catch (error) {
    console.error('Error searching recipes by first letter:', error);
    return [];
  }
}

// Main search function that tries multiple approaches
export async function searchRecipes(query: string, mealType?: string): Promise<ConvertedRecipe[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchResults: ConvertedRecipe[] = [];

  try {
    // Search by name first
    const nameResults = await searchRecipesByName(query);
    searchResults.push(...nameResults);

    // If single letter, also search by first letter
    if (query.length === 1) {
      const letterResults = await searchRecipesByFirstLetter(query);
      // Add meals that aren't already in results
      const existingUris = new Set(searchResults.map(recipe => recipe.uri));
      const newResults = letterResults.filter(recipe => !existingUris.has(recipe.uri));
      searchResults.push(...newResults);
    }

    // If no results yet, try searching by ingredient
    if (searchResults.length === 0) {
      const ingredientResults = await searchRecipesByIngredient(query);
      searchResults.push(...ingredientResults);
    }

    // Filter by meal type if specified
    let filteredResults = searchResults;
    if (mealType) {
      filteredResults = searchResults.filter(recipe => 
        recipe.mealType.some(type => type.includes(mealType.toLowerCase()))
      );
    }

    return filteredResults.slice(0, 20); // Limit to 20 results
  } catch (error) {
    console.error('Error in recipe search:', error);
    return [];
  }
}

// Get random recipes
export async function getRandomRecipes(count: number = 10): Promise<ConvertedRecipe[]> {
  const recipes: ConvertedRecipe[] = [];
  
  try {
    for (let i = 0; i < count; i++) {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const data = await response.json();
      
      if (data.meals && data.meals[0]) {
        recipes.push(convertMealToRecipe(data.meals[0]));
      }
    }
  } catch (error) {
    console.error('Error getting random recipes:', error);
  }
  
  return recipes;
}

// Fallback mock recipes for when API fails
export const getMockRecipes = (query: string): ConvertedRecipe[] => {
  const mockRecipes = [
    {
      uri: 'mock-1',
      label: 'Healthy Chicken Salad',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
      ingredients: [
        { text: '2 chicken breasts', quantity: 2, measure: 'piece', food: 'chicken breast', weight: 400 },
        { text: '1 cup mixed greens', quantity: 1, measure: 'cup', food: 'mixed greens', weight: 50 },
        { text: '1 tbsp olive oil', quantity: 1, measure: 'tbsp', food: 'olive oil', weight: 15 },
        { text: '1/2 avocado', quantity: 0.5, measure: 'piece', food: 'avocado', weight: 100 },
      ],
      steps: [
        'Season and grill chicken breasts until cooked through',
        'Let chicken cool and slice into strips',
        'Toss mixed greens with olive oil',
        'Top with chicken and avocado slices'
      ],
      calories: 350,
      yield: 2,
      totalTime: 20,
      cuisineType: ['american'],
      mealType: ['lunch'],
      tags: ['healthy', 'protein', 'salad'],
    },
    {
      uri: 'mock-2',
      label: 'Vegetarian Pasta Primavera',
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&h=200&fit=crop',
      ingredients: [
        { text: '200g pasta', quantity: 200, measure: 'g', food: 'pasta', weight: 200 },
        { text: '1 cup tomato sauce', quantity: 1, measure: 'cup', food: 'tomato sauce', weight: 240 },
        { text: '1/2 cup parmesan', quantity: 0.5, measure: 'cup', food: 'parmesan', weight: 50 },
        { text: '1 bell pepper', quantity: 1, measure: 'piece', food: 'bell pepper', weight: 150 },
      ],
      steps: [
        'Cook pasta according to package directions',
        'Sauté bell pepper until tender',
        'Heat tomato sauce in a large pan',
        'Combine pasta, vegetables, and sauce',
        'Top with parmesan cheese'
      ],
      calories: 520,
      yield: 2,
      totalTime: 25,
      cuisineType: ['italian'],
      mealType: ['dinner'],
      tags: ['vegetarian', 'pasta', 'italian'],
    },
    {
      uri: 'mock-3',
      label: 'Protein Smoothie Bowl',
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=300&h=200&fit=crop',
      ingredients: [
        { text: '1 banana', quantity: 1, measure: 'piece', food: 'banana', weight: 120 },
        { text: '1 scoop protein powder', quantity: 1, measure: 'scoop', food: 'protein powder', weight: 30 },
        { text: '1/2 cup berries', quantity: 0.5, measure: 'cup', food: 'berries', weight: 75 },
        { text: '1 tbsp chia seeds', quantity: 1, measure: 'tbsp', food: 'chia seeds', weight: 12 },
      ],
      steps: [
        'Blend banana and protein powder with a little water',
        'Pour into a bowl',
        'Top with berries and chia seeds',
        'Enjoy immediately'
      ],
      calories: 280,
      yield: 1,
      totalTime: 10,
      cuisineType: ['american'],
      mealType: ['breakfast'],
      tags: ['healthy', 'protein', 'smoothie'],
    }
  ];

  return mockRecipes.filter(recipe => 
    recipe.label.toLowerCase().includes(query.toLowerCase()) ||
    recipe.tags.some(tag => tag.includes(query.toLowerCase()))
  );
};
