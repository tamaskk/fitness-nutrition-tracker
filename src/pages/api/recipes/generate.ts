import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import OpenAI from 'openai';
import { getUserFromToken } from '@/utils/auth';
import User from '@/models/User';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 50000, // 50 second timeout for OpenAI requests
});

// Increase API route timeout (works on Vercel)
export const config = {
  maxDuration: 60, // 60 seconds (requires Vercel Pro for >10s)
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tokenUser = getUserFromToken(req);
    const session = await getServerSession(req, res, authOptions);
    
    const userEmail = tokenUser?.email || session?.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    } 

    const userId = user._id;

    const { ingredients, count = 10, offset = 0 } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }

    // Limit count to prevent JSON parsing issues and timeout
    const safeCount = Math.min(count, 3); // Reduced from 5 to 3 for faster response

    const ingredientsList = ingredients.join(', ');
    
    const prompt = `Te egy professzionális szakács és receptfejlesztő vagy. Generálj ${safeCount} különböző, kreatív és finom receptet, amelyek MINDEN alábbi hozzávalót HASZNÁLNAK: ${ingredientsList}.

Minden recepthez add meg:
1. Kreatív és vonzó címet (magyarul)
2. Rövid leírást (1-2 mondat, magyarul)
3. Teljes hozzávalólistát pontos mennyiségekkel és mértékegységekkel (magyarul)
4. Részletes, lépésről lépésre főzési utasításokat (magyarul)
5. Becsült főzési időt
6. Adagok számát
7. Nehézségi szintet (Könnyű/Közepes/Nehéz)
8. Kategóriát (reggeli/ebéd/vacsora/uzsonna/desszert)
9. Kalória/adag számítást
10. Fehérje per adag
11. Szénhidrát per adag
12. Zsír per adag
13. Nyers anyagok
14. Micro és makro adatok

FONTOS: Minden hozzávalóhoz add meg a pontos mennyiséget és mértékegységet (pl. "300 g csirkemell", "2 db édesburgonya", "3 db tojás", "1 teáskanál só").

Követelmények:
- MINDEN recept HASZNÁLJA az összes megadott hozzávalót: ${ingredientsList}
- Legyél kreatív és változatos - ne ismételd a hasonló recepteket
- Adj gyakorlati főzési tippeket
- Az utasítások legyenek világosak és könnyen követhetők
- Figyelembe vedd a magyar konyha ízvilágát és preferenciáit
- Adj reális főzési időket és adagméretet
- Számítsd ki a kalória/adag értéket minden recepthez
- MINDEN szöveg legyen magyarul

Válasz JSON tömb formátumban, pontosan ezzel a struktúrával:
[
  {
    "title": "Recept címe",
    "description": "Rövid leírás a receptről",
    "ingredients": [
      {"name": "hozzávaló neve", "amount": "mennyiség", "unit": "mértékegység"}
    ],
    "instructions": [
      {
        "step": "Részletes utasítás mit kell csinálni ebben a lépésben",
        "ingredient": "Az ehhez a lépéshez szükséges hozzávalók listája (pl. '300g csirkemell, 1 teáskanál só')"
      },
      {
        "step": "Következő lépés részletes utasítása",
        "ingredient": "Az ehhez a lépéshez szükséges hozzávalók"
      }
    ],
    "cookingTime": "30 perc",
    "servings": 4,
    "difficulty": "Könnyű",
    "category": "vacsora",
    "caloriesPerServing": 350,
    "proteinPerServing": 20,
    "carbsPerServing": 30,
    "fatPerServing": 10,
    "fiberPerServing": 5,
    "microNutrients": {
      "vitaminA": 100,
      "vitaminC": 100,
      "vitaminD": 100,
    },
    "macroNutrients": {
      "protein": 20,
      "carbs": 30,
      "fat": 10,
      "fiber": 5,
    },
    "tags": ["címke1", "címke2"]
  }
]

PÉLDA hozzávalólista:
"ingredients": [
  {"name": "csirkemell", "amount": "300", "unit": "g"},
  {"name": "édesburgonya", "amount": "2", "unit": "db"},
  {"name": "tojás", "amount": "3", "unit": "db"},
  {"name": "só", "amount": "1", "unit": "teáskanál"},
  {"name": "bors", "amount": "0.5", "unit": "teáskanál"},
  {"name": "vaj", "amount": "2", "unit": "evőkanál"}
]

Generálj pontosan ${safeCount} különböző receptet. Legyenek változatosak és érdekesek, miközben minden egyes recept használja az összes megadott hozzávalót.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Te egy professzionális szakács és receptfejlesztő vagy. Mindig érvényes JSON tömböket adj vissza a megadott struktúrával. Minden szöveg legyen magyarul. Számítsd ki a kalória/adag értéket minden recepthez. MINDEN hozzávalóhoz add meg a pontos mennyiséget és mértékegységet (pl. '300 g csirkemell', '2 db édesburgonya'). FONTOS: Az 'instructions' tömb elemei objektumok legyenek 'step' és 'ingredient' mezőkkel! A JSON válaszban ne használj sortöréseket a szövegekben, és minden idézőjelet escape-elj (\\\")."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000, // Reduced from 3000 to speed up response time
      temperature: 0.5, // Lower for faster, more consistent formatting
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    console.log('OpenAI response content length:', content.length);
    console.log('OpenAI response preview:', content.substring(0, 500));

    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Content that failed to parse:', content);
      
      // Try to fix common JSON issues
      let fixedContent = content;
      
      // Remove any trailing commas
      fixedContent = fixedContent.replace(/,(\s*[}\]])/g, '$1');
      
      // Try to find and fix unterminated strings
      const stringMatches = fixedContent.match(/"[^"]*$/);
      if (stringMatches) {
        console.log('Found unterminated string, attempting to fix...');
        fixedContent = fixedContent.replace(/"[^"]*$/, '"');
      }
      
      // Try parsing again
      try {
        result = JSON.parse(fixedContent);
        console.log('Successfully parsed after fixing JSON');
      } catch (secondError) {
        console.error('Still failed to parse after fixes:', secondError);
        const errorMsg = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
        throw new Error(`Invalid JSON response from OpenAI: ${errorMsg}`);
      }
    }
    
    // Handle both array and object responses
    let recipes = Array.isArray(result) ? result : result.recipes || [];
    
    // Ensure we have the right number of recipes
    if (recipes.length > safeCount) {
      recipes = recipes.slice(0, safeCount);
    }

    // Helper function to convert time string to number
    const parseTimeToMinutes = (timeValue: any): number => {
      if (typeof timeValue === 'number') {
        return timeValue;
      }
      if (typeof timeValue === 'string') {
        // Extract number from strings like "50 perc", "30 minutes", "1 óra"
        const match = timeValue.match(/(\d+)/);
        return match ? parseInt(match[1]) : 30; // Default to 30 minutes
      }
      return 30; // Default to 30 minutes
    };

    // Add metadata to each recipe
    const recipesWithMetadata = recipes.map((recipe: any, index: number) => ({
      ...recipe,
      id: `ai-${Date.now()}-${index}`,
      source: 'openai',
      generatedAt: new Date().toISOString(),
      requiredIngredients: ingredients,
      externalId: `ai-recipe-${Date.now()}-${index}`,
      imageUrl: null, // AI doesn't generate images
      prepTime: parseTimeToMinutes(recipe.cookingTime),
      cookTime: parseTimeToMinutes(recipe.cookingTime),
      totalTime: parseTimeToMinutes(recipe.cookingTime),
      
      // Nutritional information per serving
      caloriesPerServing: recipe.caloriesPerServing || 0,
      proteinPerServing: recipe.proteinPerServing || 0,
      carbsPerServing: recipe.carbsPerServing || 0,
      fatPerServing: recipe.fatPerServing || 0,
      fiberPerServing: recipe.fiberPerServing || 0,
      
      // Legacy nutrition object (for backward compatibility)
      nutrition: {
        calories: recipe.caloriesPerServing || 0,
        protein: recipe.proteinPerServing || null,
        carbs: recipe.carbsPerServing || null,
        fat: recipe.fatPerServing || null,
        fiber: recipe.fiberPerServing || null
      },
      
      // Macro nutrients
      macroNutrients: recipe.macroNutrients || {
        protein: recipe.proteinPerServing || 0,
        carbs: recipe.carbsPerServing || 0,
        fat: recipe.fatPerServing || 0,
        fiber: recipe.fiberPerServing || 0
      },
      
      // Micro nutrients
      microNutrients: recipe.microNutrients || {
        vitaminA: 0,
        vitaminC: 0,
        vitaminD: 0
      },
      
      userId: 'asd',
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Ensure Hungarian content
      title: recipe.title || 'Recept',
      description: recipe.description || 'Finom recept',
      category: recipe.category || 'vacsora',
      difficulty: recipe.difficulty || 'Könnyű',
      instructions: recipe.instructions || ['Nincs elérhető utasítás ehhez a recepthez.'],
      ingredients: recipe.ingredients || [],
      tags: recipe.tags || []
    }));

    res.status(200).json({
      success: true,
      recipes: recipesWithMetadata,
      totalGenerated: recipesWithMetadata.length,
      ingredients: ingredients,
      offset: offset
    });

  } catch (error) {
    console.error('OpenAI recipe generation error:', error);
    
    // Check if it's a timeout error
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        return res.status(504).json({ 
          success: false, 
          error: 'Request timed out. Try reducing the number of recipes or ingredients.',
          code: 'TIMEOUT'
        });
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
}