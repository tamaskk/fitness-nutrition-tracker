// Frontend utility for calling Edamam Recipe API
export interface EdamamRecipe {
  uri: string;
  label: string;
  image: string;
  source: string;
  url: string;
  yield: number;
  calories: number;
  totalTime: number;
  ingredientLines: string[];
  ingredients: {
    text: string;
    quantity: number;
    measure: string;
    food: string;
    weight: number;
  }[];
  totalNutrients: any;
  cuisineType: string[];
  mealType: string[];
  dishType: string[];
  dietLabels: string[];
  healthLabels: string[];
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
  source: string;
  url: string;
}

// Convert Edamam format to our app format
function convertEdamamToRecipe(hit: any): ConvertedRecipe {
  const recipe = hit.recipe;
  
  // Convert ingredient lines to our format
  const ingredients = recipe.ingredientLines?.map((line: string, index: number) => ({
    text: line,
    quantity: 0, // Edamam doesn't provide parsed quantities easily
    measure: '',
    food: line.replace(/^\d+\s*\w*\s*/, ''), // Try to extract food name
          weight: 100,
  })) || [];

  return {
    uri: recipe.uri,
    label: recipe.label,
    image: recipe.image,
    ingredients,
    steps: [], // Edamam doesn't provide cooking instructions
    calories: Math.round(recipe.calories || 0),
    yield: recipe.yield || 4,
    totalTime: recipe.totalTime || 30,
    cuisineType: recipe.cuisineType || ['nemzetközi'],
    mealType: recipe.mealType || ['főétel'],
    tags: [
      ...(recipe.cuisineType || []),
      ...(recipe.mealType || []),
      ...(recipe.dishType || []),
      ...(recipe.dietLabels || []),
      ...(recipe.healthLabels?.slice(0, 3) || [])
    ].map(tag => tag.toLowerCase()),
    source: recipe.source,
    url: recipe.url,
  };
}

// Search recipes using Edamam Recipe API with enhanced search strategy
export async function searchRecipes(query: string, mealType?: string): Promise<ConvertedRecipe[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const allRecipes: ConvertedRecipe[] = [];
    const searchTerms = [query.trim()];
    
    // Add related search terms for better coverage
    const relatedTerms: { [key: string]: string[] } = {
      'chicken': ['chicken breast', 'chicken thigh', 'chicken recipe', 'grilled chicken'],
      'beef': ['beef steak', 'ground beef', 'beef roast', 'beef recipe'],
      'pasta': ['spaghetti', 'penne', 'pasta recipe', 'italian pasta'],
      'salad': ['green salad', 'caesar salad', 'mixed salad', 'healthy salad'],
      'soup': ['vegetable soup', 'chicken soup', 'tomato soup', 'soup recipe'],
      'fish': ['salmon', 'tuna', 'fish fillet', 'seafood recipe'],
    };
    
    // Add related terms if available
    const lowerQuery = query.toLowerCase();
    for (const [key, terms] of Object.entries(relatedTerms)) {
      if (lowerQuery.includes(key)) {
        searchTerms.push(...terms.slice(0, 2)); // Add 2 related terms
        break;
      }
    }
    
    // Search with all terms
    const searchPromises = searchTerms.map(term => {
      const params = new URLSearchParams({
        q: term,
        ...(mealType && { mealType })
      });
      return fetch(`/api/recipes/edamam-search?${params}`);
    });
    
    const responses = await Promise.all(searchPromises);
    
    for (const response of responses) {
      if (response.ok) {
        const data = await response.json();
        const recipes = data.hits?.map(convertEdamamToRecipe) || [];
        allRecipes.push(...recipes);
      }
    }
    
    // Remove duplicates based on URI
    const uniqueRecipes = allRecipes.filter((recipe, index, self) => 
      index === self.findIndex(r => r.uri === recipe.uri)
    );
    
    return uniqueRecipes.slice(0, 50); // Return up to 50 unique recipes
  } catch (error) {
    console.error('Error searching recipes:', error);
    return [];
  }
}

// Search recipes by ingredient using Edamam
export async function searchRecipesByIngredient(ingredient: string): Promise<ConvertedRecipe[]> {
  return searchRecipes(ingredient);
}

// Search recipes by name using Edamam
export async function searchRecipesByName(query: string): Promise<ConvertedRecipe[]> {
  return searchRecipes(query);
}

// Get random recipes using Edamam (search for common terms)
export async function getRandomRecipes(count: number = 10): Promise<ConvertedRecipe[]> {
  const commonSearchTerms = [
    'chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp',
    'pasta', 'rice', 'quinoa', 'noodles',
    'salad', 'soup', 'stew', 'curry', 'stir-fry',
    'vegetarian', 'vegan', 'healthy', 'quick',
    'italian', 'mexican', 'asian', 'mediterranean',
    'breakfast', 'lunch', 'dinner', 'snack'
  ];
  
  try {
    // Try multiple search terms to get variety
    const allRecipes: ConvertedRecipe[] = [];
    const searchPromises = [];
    
    // Search with 3-4 different terms
    for (let i = 0; i < Math.min(4, commonSearchTerms.length); i++) {
      const randomTerm = commonSearchTerms[Math.floor(Math.random() * commonSearchTerms.length)];
      searchPromises.push(searchRecipes(randomTerm));
    }
    
    const results = await Promise.all(searchPromises);
    results.forEach(recipes => allRecipes.push(...recipes));
    
    // Remove duplicates and return random selection
    const uniqueRecipes = allRecipes.filter((recipe, index, self) => 
      index === self.findIndex(r => r.uri === recipe.uri)
    );
    
    // Shuffle and return requested count
    const shuffled = uniqueRecipes.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error getting random recipes:', error);
    return [];
  }
}

// Fallback mock recipes for when API fails
export const getMockRecipes = (query: string): ConvertedRecipe[] => {
  const mockRecipes = [
    {
      uri: 'mock-1',
      label: 'Egészséges csirkesaláta',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
      ingredients: [
        { text: '2 csirkemell', quantity: 2, measure: 'darab', food: 'csirkemell', weight: 400 },
        { text: '1 csésze vegyes saláta', quantity: 1, measure: 'csésze', food: 'vegyes saláta', weight: 50 },
        { text: '1 ek olívaolaj', quantity: 1, measure: 'ek', food: 'olívaolaj', weight: 15 },
        { text: '1/2 avokádó', quantity: 0.5, measure: 'darab', food: 'avokádó', weight: 100 },
      ],
      steps: [
        'Fűszerezd és grillezd meg a csirkemellet, amíg át nem sül',
        'Hagyd kihűlni a csirkét és vágd csíkokra',
        'Keverd össze a salátát az olívaolajjal',
        'Tedd a tetejére a csirke és avokádó szeleteket'
      ],
      calories: 350,
      yield: 2,
      totalTime: 20,
      cuisineType: ['amerikai'],
      mealType: ['ebéd'],
      tags: ['egészséges', 'fehérje', 'saláta'],
      source: 'Házi recept',
      url: '',
    },
    {
      uri: 'mock-2',
      label: 'Vegetáriánus tészta primavera',
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&h=200&fit=crop',
      ingredients: [
        { text: '200g tészta', quantity: 200, measure: 'g', food: 'tészta', weight: 200 },
        { text: '1 csésze paradicsom szósz', quantity: 1, measure: 'csésze', food: 'paradicsom szósz', weight: 240 },
        { text: '1/2 csésze parmezán', quantity: 0.5, measure: 'csésze', food: 'parmezán', weight: 50 },
        { text: '1 paprika', quantity: 1, measure: 'darab', food: 'paprika', weight: 150 },
      ],
      steps: [
        'Főzd meg a tésztát a csomagoláson található utasítás szerint',
        'Pirítsd meg a paprikát, amíg puha nem lesz',
        'Melegítsd fel a paradicsom szószt egy nagy serpenyőben',
        'Keverd össze a tésztát, zöldségeket és szószt',
        'Szórd meg parmezán sajttal'
      ],
      calories: 520,
      yield: 2,
      totalTime: 25,
      cuisineType: ['olasz'],
      mealType: ['vacsora'],
      tags: ['vegetáriánus', 'tészta', 'olasz'],
      source: 'Házi recept',
      url: '',
    },
    {
      uri: 'mock-3',
      label: 'Fehérje smoothie tál',
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=300&h=200&fit=crop',
      ingredients: [
        { text: '1 banán', quantity: 1, measure: 'darab', food: 'banán', weight: 120 },
        { text: '1 adag fehérjepor', quantity: 1, measure: 'adag', food: 'fehérjepor', weight: 30 },
        { text: '1/2 csésze bogyós gyümölcs', quantity: 0.5, measure: 'csésze', food: 'bogyós gyümölcs', weight: 75 },
        { text: '1 ek chia mag', quantity: 1, measure: 'ek', food: 'chia mag', weight: 12 },
      ],
      steps: [
        'Mixeld össze a banánt és fehérjeport egy kevés vízzel',
        'Öntsd egy tálba',
        'Tedd a tetejére a bogyós gyümölcsöket és chia magokat',
        'Azonnal fogyaszd el'
      ],
      calories: 280,
      yield: 1,
      totalTime: 10,
      cuisineType: ['amerikai'],
      mealType: ['reggeli'],
      tags: ['egészséges', 'fehérje', 'smoothie'],
      source: 'Házi recept',
      url: '',
    },
    {
      uri: 'mock-4',
      label: 'Grillezett csirkemell',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=200&fit=crop',
      ingredients: [
        { text: '4 csirkemell', quantity: 4, measure: 'darab', food: 'csirkemell', weight: 800 },
        { text: '2 ek olívaolaj', quantity: 2, measure: 'ek', food: 'olívaolaj', weight: 30 },
        { text: 'só és bors', quantity: 0, measure: '', food: 'fűszerek', weight: 5 },
      ],
      steps: [
        'Fűszerezd a csirkemellet sóval és borssal',
        'Melegítsd fel a grillt vagy serpenyőt',
        'Grillezd 6-8 percig mindkét oldalon',
        'Hagyd pihenni 5 percet tálalás előtt'
      ],
      calories: 450,
      yield: 4,
      totalTime: 25,
      cuisineType: ['amerikai'],
      mealType: ['vacsora'],
      tags: ['egészséges', 'fehérje', 'grillezett'],
      source: 'Házi recept',
      url: '',
    },
    {
      uri: 'mock-5',
      label: 'Csirke curry',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop',
      ingredients: [
        { text: '500g csirkemell', quantity: 500, measure: 'g', food: 'csirkemell', weight: 500 },
        { text: '400ml kókusztej', quantity: 400, measure: 'ml', food: 'kókusztej', weight: 400 },
        { text: '2 ek curry por', quantity: 2, measure: 'ek', food: 'curry por', weight: 15 },
        { text: '1 hagyma', quantity: 1, measure: 'darab', food: 'hagyma', weight: 150 },
      ],
      steps: [
        'Vágd kockára a csirkemellet',
        'Pirítsd meg a hagymát olajban',
        'Add hozzá a csirkét és süsd át',
        'Öntsd fel a kókusztejjel és curry porral',
        'Főzd 20 percig'
      ],
      calories: 380,
      yield: 4,
      totalTime: 35,
      cuisineType: ['indiai'],
      mealType: ['vacsora'],
      tags: ['fűszeres', 'krémes', 'egzotikus'],
      source: 'Házi recept',
      url: '',
    },
    {
      uri: 'mock-6',
      label: 'Csirke Caesar saláta',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop',
      ingredients: [
        { text: '2 csirkemell', quantity: 2, measure: 'darab', food: 'csirkemell', weight: 400 },
        { text: '1 fej római saláta', quantity: 1, measure: 'fej', food: 'római saláta', weight: 300 },
        { text: '1/2 csésze parmezán', quantity: 0.5, measure: 'csésze', food: 'parmezán', weight: 50 },
        { text: 'Caesar öntet', quantity: 0, measure: '', food: 'Caesar öntet', weight: 50 },
      ],
      steps: [
        'Grillezd meg a csirkemellet',
        'Vágd csíkokra a csirkét',
        'Tépd fel a salátát',
        'Keverd össze az öntettel',
        'Szórd meg parmezánnal'
      ],
      calories: 420,
      yield: 2,
      totalTime: 20,
      cuisineType: ['amerikai'],
      mealType: ['ebéd'],
      tags: ['saláta', 'fehérje', 'friss'],
      source: 'Házi recept',
      url: '',
    }
  ];

  return mockRecipes.filter(recipe => 
    recipe.label.toLowerCase().includes(query.toLowerCase()) ||
    recipe.tags.some(tag => tag.includes(query.toLowerCase())) ||
    recipe.ingredients.some(ing => ing.food.toLowerCase().includes(query.toLowerCase()))
  );
};
