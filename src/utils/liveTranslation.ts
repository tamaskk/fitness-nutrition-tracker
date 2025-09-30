// Live translation utility for recipe content
export interface TranslationResult {
  translatedText: string;
  originalText: string;
  targetLanguage: string;
}

// Hungarian food dictionary for reliable translations
const hungarianFoodDict: { [key: string]: string } = {
  // Proteins
  'chicken': 'csirke',
  'chicken breast': 'csirkemell',
  'chicken breasts': 'csirkemell',
  'beef': 'marhahús',
  'pork': 'sertéshús',
  'salmon': 'lazac',
  'fish': 'hal',
  'egg': 'tojás',
  'eggs': 'tojás',
  
  // Vegetables
  'onion': 'hagyma',
  'onions': 'hagyma',
  'carrot': 'sárgarépa',
  'carrots': 'sárgarépa',
  'potato': 'burgonya',
  'potatoes': 'burgonya',
  'tomato': 'paradicsom',
  'tomatoes': 'paradicsom',
  'spinach': 'spenót',
  'baby spinach': 'bébi spenót',
  'broccoli': 'brokkoli',
  'pepper': 'paprika',
  'bell pepper': 'kaliforniai paprika',
  'garlic': 'fokhagyma',
  'ginger': 'gyömbér',
  
  // Dairy
  'milk': 'tej',
  'cheese': 'sajt',
  'mozzarella': 'mozzarella',
  'parmesan': 'parmezán',
  'butter': 'vaj',
  'cream': 'tejszín',
  'sour cream': 'tejföl',
  'yogurt': 'joghurt',
  
  // Grains & Carbs
  'rice': 'rizs',
  'pasta': 'tészta',
  'bread': 'kenyér',
  'flour': 'liszt',
  'quinoa': 'quinoa',
  
  // Seasonings
  'salt': 'só',
  'pepper': 'bors',
  'sugar': 'cukor',
  'honey': 'méz',
  'oil': 'olaj',
  'olive oil': 'olívaolaj',
  'vegetable oil': 'növényi olaj',
  'soy sauce': 'szójaszósz',
  'vinegar': 'ecet',
  
  // Others
  'water': 'víz',
  'wine': 'bor',
  'lemon': 'citrom',
  'lime': 'lime',
  'parsley': 'petrezselyem',
  'basil': 'bazsalikom',
  'oregano': 'oregánó',
};

// Free translation using MyMemory API (no API key needed) with dictionary fallback
export async function translateText(text: string, targetLang: string = 'hu'): Promise<string> {
  if (!text || text.trim() === '') return text;
  
  // Don't translate if it's just numbers, measurements, or very short
  if (/^\d+[\s\d\/]*$/.test(text.trim()) || text.trim().length < 2) {
    return text;
  }
  
  // For Hungarian, try dictionary first
  if (targetLang === 'hu') {
    const lowerText = text.toLowerCase().trim();
    if (hungarianFoodDict[lowerText]) {
      return hungarianFoodDict[lowerText];
    }
    
    // Check for partial matches
    for (const [english, hungarian] of Object.entries(hungarianFoodDict)) {
      if (lowerText.includes(english)) {
        return lowerText.replace(english, hungarian);
      }
    }
  }
  
  try {
    // Clean the text for better translation
    const cleanText = text.trim();
    
    // MyMemory API - free translation service
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=en|${targetLang}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FitnessTracker/1.0)',
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.responseData && data.responseData.translatedText) {
        let translated = data.responseData.translatedText;
        
        // Clean up common translation issues
        translated = translated.replace(/\s+/g, ' ').trim();
        
        return translated;
      }
    }
  } catch (error) {
    console.error('Translation error:', error);
  }
  
  // Return original text if translation fails
  return text;
}

// Translate an array of texts
export async function translateTexts(texts: string[], targetLang: string = 'hu'): Promise<string[]> {
  const translations = await Promise.all(
    texts.map(text => translateText(text, targetLang))
  );
  return translations;
}

// Translate recipe ingredients
export async function translateIngredients(ingredients: any[], targetLang: string = 'hu'): Promise<any[]> {
  if (!ingredients || ingredients.length === 0) return ingredients;
  
  try {
    const translatedIngredients = await Promise.all(
      ingredients.map(async (ingredient) => {
        const originalText = ingredient.text || ingredient.name || '';
        
        // Don't translate if text is empty, just numbers, or too short
        if (!originalText || originalText.trim().length < 2) {
          return ingredient;
        }
        
        // Skip translation for just numbers or empty measures
        if (/^\d+$/.test(originalText.trim()) || originalText.trim() === '') {
          return ingredient;
        }
        
        // Simple and reliable approach: use regex to separate measurement from ingredient
        const text = originalText.trim();
        
        // Pattern to match: [number/fraction] [unit] [ingredient]
        // Examples: "2 cups flour", "1/2 tsp salt", "3 chicken breasts", "Salt" (no measurement)
        const measureRegex = /^(\d+(?:\/\d+)?\s*(?:cup|cups|tsp|tbsp|teaspoon|tablespoon|tablespoons|oz|ounce|ounces|lb|pound|pounds|g|gram|grams|kg|kilogram|kilograms|piece|pieces|clove|cloves|slice|slices|large|medium|small)?\.?)\s+(.+)$/i;
        const match = text.match(measureRegex);
        
        let translatedText;
        if (match) {
          // Has measurement + ingredient
          const [, measurement, ingredientName] = match;
          const translatedIngredient = await translateTextCached(ingredientName.trim(), targetLang);
          translatedText = `${measurement} ${translatedIngredient}`;
        } else {
          // No measurement, just ingredient name
          translatedText = await translateTextCached(text, targetLang);
        }
        
        return {
          ...ingredient,
          text: translatedText,
          name: translatedText,
          originalText: originalText,
          translatedText: translatedText,
        };
      })
    );
    
    return translatedIngredients.filter(ing => ing.text && ing.text.trim().length > 0);
  } catch (error) {
    console.error('Error translating ingredients:', error);
    return ingredients;
  }
}

// Translate recipe steps/instructions
export async function translateSteps(steps: string[], targetLang: string = 'hu'): Promise<string[]> {
  if (!steps || steps.length === 0) return steps;
  
  try {
    const translatedSteps = await Promise.all(
      steps.map(step => translateText(step, targetLang))
    );
    
    return translatedSteps;
  } catch (error) {
    console.error('Error translating steps:', error);
    return steps;
  }
}

// Translate recipe title
export async function translateTitle(title: string, targetLang: string = 'hu'): Promise<string> {
  return await translateText(title, targetLang);
}

// Translate entire recipe object
export async function translateRecipe(recipe: any, targetLang: string = 'hu'): Promise<any> {
  if (targetLang === 'en') return recipe; // No translation needed for English
  
  try {
    const [translatedTitle, translatedIngredients, translatedSteps] = await Promise.all([
      translateTitle(recipe.label || recipe.title, targetLang),
      translateIngredients(recipe.ingredients || [], targetLang),
      translateSteps(recipe.steps || [], targetLang),
    ]);

    return {
      ...recipe,
      label: translatedTitle,
      title: translatedTitle,
      ingredients: translatedIngredients,
      steps: translatedSteps,
      originalLabel: recipe.label || recipe.title,
      isTranslated: true,
      translatedTo: targetLang,
    };
  } catch (error) {
    console.error('Error translating recipe:', error);
    return recipe;
  }
}

// Batch translate multiple recipes
export async function translateRecipes(recipes: any[], targetLang: string = 'hu'): Promise<any[]> {
  if (targetLang === 'en') return recipes;
  
  try {
    // Translate recipes in batches to avoid rate limits
    const batchSize = 3;
    const translatedRecipes = [];
    
    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize);
      const translatedBatch = await Promise.all(
        batch.map(recipe => translateRecipe(recipe, targetLang))
      );
      translatedRecipes.push(...translatedBatch);
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < recipes.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return translatedRecipes;
  } catch (error) {
    console.error('Error translating recipes:', error);
    return recipes;
  }
}

// Cache translations to avoid repeated API calls
const translationCache = new Map<string, string>();

export async function translateTextCached(text: string, targetLang: string = 'hu'): Promise<string> {
  const cacheKey = `${text}_${targetLang}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }
  
  const translated = await translateText(text, targetLang);
  translationCache.set(cacheKey, translated);
  
  return translated;
}
