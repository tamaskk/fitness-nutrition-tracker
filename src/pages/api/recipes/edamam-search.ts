import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { q: query, mealType, cuisineType, diet, health } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    // Use Edamam Recipe Search API
    const appId = process.env.EDAMAM_APP_ID;
    const appKey = process.env.EDAMAM_API_KEY;

    if (!appId || !appKey) {
      console.warn('Edamam Recipe API credentials not found, using fallback data');
      console.log('Available env vars:', {
        hasAppId: !!process.env.EDAMAM_APP_ID,
        hasAppKey: !!process.env.EDAMAM_API_KEY,
        appIdLength: process.env.EDAMAM_APP_ID?.length,
        appKeyLength: process.env.EDAMAM_API_KEY?.length
      });
      return res.status(200).json(getFallbackRecipeData(query));
    }

    console.log('Using Edamam Recipe API with credentials:', {
      appId: appId.substring(0, 4) + '***',
      query,
    });

    // Try different Edamam API endpoints
    const endpoints = [
      // Recipe Search API v2
      `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(query)}&app_id=${appId}&app_key=${appKey}&from=0&to=20`,
      // Recipe Search API v1 (legacy)
      `https://api.edamam.com/search?q=${encodeURIComponent(query)}&app_id=${appId}&app_key=${appKey}&from=0&to=20`,
    ];

    let response;
    let workingEndpoint = '';
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint.replace(appKey, appKey.substring(0, 4) + '***'));
        response = await fetch(endpoint);
        if (response.ok) {
          workingEndpoint = endpoint;
          console.log('Successfully connected to:', workingEndpoint.replace(appKey, appKey.substring(0, 4) + '***'));
          break;
        } else {
          console.log(`Endpoint failed with status: ${response.status}`);
          const errorText = await response.text();
          console.log('Error details:', errorText);
        }
      } catch (err) {
        console.log('Endpoint error:', err.message);
      }
    }
    
    if (!response || !response.ok) {
      console.error('All Edamam endpoints failed, using fallback data');
      throw new Error('All Edamam endpoints failed');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Edamam Recipe API error:', error);
    // Return fallback data if API fails
    res.status(200).json(getFallbackRecipeData(query));
  }
}

// Fallback recipe data when API is unavailable
function getFallbackRecipeData(query: string) {
  const mockRecipes = [
    // Chicken recipes
    {
      recipe: {
        uri: 'fallback-1',
        label: 'Egészséges csirkesaláta',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 2,
        calories: 350,
        totalTime: 20,
        ingredientLines: ['2 csirkemell', '1 csésze vegyes saláta', '1 ek olívaolaj', '1/2 avokádó'],
        cuisineType: ['amerikai'],
        mealType: ['ebéd'],
        dishType: ['saláta'],
        dietLabels: [],
        healthLabels: ['alacsony szénhidrát'],
      }
    },
    {
      recipe: {
        uri: 'fallback-2',
        label: 'Grillezett csirkemell',
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 4,
        calories: 450,
        totalTime: 25,
        ingredientLines: ['4 csirkemell', '2 ek olívaolaj', '1 tk só', '1 tk fekete bors', '1 tk fokhagymapor'],
        cuisineType: ['amerikai'],
        mealType: ['vacsora'],
        dishType: ['grillezett'],
        dietLabels: [],
        healthLabels: ['magas fehérje'],
      }
    },
    {
      recipe: {
        uri: 'fallback-3',
        label: 'Csirke curry',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 4,
        calories: 380,
        totalTime: 35,
        ingredientLines: ['500g csirkemell', '1 hagyma', '2 gerezd fokhagyma', '400ml kókusztej', '2 ek curry por'],
        cuisineType: ['indiai'],
        mealType: ['vacsora'],
        dishType: ['curry'],
        dietLabels: [],
        healthLabels: ['gluténmentes'],
      }
    },
    {
      recipe: {
        uri: 'fallback-4',
        label: 'Csirke stir-fry',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 3,
        calories: 320,
        totalTime: 15,
        ingredientLines: ['400g csirkemell', '1 paprika', '1 cukkini', '2 ek szójaszósz', '1 ek olaj'],
        cuisineType: ['ázsiai'],
        mealType: ['vacsora'],
        dishType: ['stir-fry'],
        dietLabels: [],
        healthLabels: ['alacsony zsír'],
      }
    },
    {
      recipe: {
        uri: 'fallback-5',
        label: 'Csirke parmezán',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 4,
        calories: 480,
        totalTime: 40,
        ingredientLines: ['4 csirkemell', '1 csésze zsemlemorzsa', '1/2 csésze parmezán', '2 tojás', '2 csésze paradicsom szósz'],
        cuisineType: ['olasz'],
        mealType: ['vacsora'],
        dishType: ['sült'],
        dietLabels: [],
        healthLabels: [],
      }
    },
    {
      recipe: {
        uri: 'fallback-6',
        label: 'Csirke quesadilla',
        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 2,
        calories: 420,
        totalTime: 15,
        ingredientLines: ['2 tortilla', '200g főtt csirke', '1 csésze reszelt sajt', '1/2 hagyma', '1 paprika'],
        cuisineType: ['mexikói'],
        mealType: ['ebéd'],
        dishType: ['quesadilla'],
        dietLabels: [],
        healthLabels: [],
      }
    },
    // Pasta recipes
    {
      recipe: {
        uri: 'fallback-7',
        label: 'Vegetáriánus tészta primavera',
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 2,
        calories: 520,
        totalTime: 25,
        ingredientLines: ['200g tészta', '1 csésze paradicsom szósz', '1/2 csésze parmezán', '1 paprika'],
        cuisineType: ['olasz'],
        mealType: ['vacsora'],
        dishType: ['tészta'],
        dietLabels: ['vegetáriánus'],
        healthLabels: ['vegetáriánus'],
      }
    },
    {
      recipe: {
        uri: 'fallback-8',
        label: 'Spagetti carbonara',
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 4,
        calories: 650,
        totalTime: 20,
        ingredientLines: ['400g spagetti', '200g szalonna', '4 tojás', '1 csésze parmezán', '2 gerezd fokhagyma'],
        cuisineType: ['olasz'],
        mealType: ['vacsora'],
        dishType: ['tészta'],
        dietLabels: [],
        healthLabels: [],
      }
    },
    // Salad recipes
    {
      recipe: {
        uri: 'fallback-9',
        label: 'Caesar saláta',
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 2,
        calories: 280,
        totalTime: 15,
        ingredientLines: ['1 fej római saláta', '1/2 csésze parmezán', '1/4 csésze caesar öntet', '1/2 csésze krutont'],
        cuisineType: ['amerikai'],
        mealType: ['ebéd'],
        dishType: ['saláta'],
        dietLabels: ['vegetáriánus'],
        healthLabels: ['vegetáriánus'],
      }
    },
    // Soup recipes
    {
      recipe: {
        uri: 'fallback-10',
        label: 'Paradicsom leves',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 4,
        calories: 180,
        totalTime: 30,
        ingredientLines: ['6 nagy paradicsom', '1 hagyma', '2 gerezd fokhagyma', '500ml zöldség alaplé', '2 ek olívaolaj'],
        cuisineType: ['mediterrán'],
        mealType: ['ebéd'],
        dishType: ['leves'],
        dietLabels: ['vegetáriánus', 'vegán'],
        healthLabels: ['vegetáriánus', 'vegán'],
      }
    },
    // Beef recipes
    {
      recipe: {
        uri: 'fallback-11',
        label: 'Marhapörkölt',
        image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 6,
        calories: 420,
        totalTime: 120,
        ingredientLines: ['1kg marhahús', '3 nagy hagyma', '3 ek paprikapor', '2 paradicsom', '1 paprika'],
        cuisineType: ['magyar'],
        mealType: ['vacsora'],
        dishType: ['pörkölt'],
        dietLabels: [],
        healthLabels: ['gluténmentes'],
      }
    },
    // Fish recipes
    {
      recipe: {
        uri: 'fallback-12',
        label: 'Grillezett lazac',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 4,
        calories: 380,
        totalTime: 20,
        ingredientLines: ['4 lazac filé', '2 ek olívaolaj', '1 citrom', '2 gerezd fokhagyma', 'só és bors'],
        cuisineType: ['mediterrán'],
        mealType: ['vacsora'],
        dishType: ['grillezett'],
        dietLabels: [],
        healthLabels: ['omega-3', 'alacsony szénhidrát'],
      }
    },
    // More chicken recipes for variety
    {
      recipe: {
        uri: 'fallback-13',
        label: 'Csirke tikka masala',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 4,
        calories: 420,
        totalTime: 45,
        ingredientLines: ['600g csirkemell', '200ml tejszín', '400g konzerv paradicsom', '2 ek garam masala', '1 hagyma'],
        cuisineType: ['indiai'],
        mealType: ['vacsora'],
        dishType: ['curry'],
        dietLabels: [],
        healthLabels: ['gluténmentes'],
      }
    },
    {
      recipe: {
        uri: 'fallback-14',
        label: 'Csirke fajitas',
        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 4,
        calories: 380,
        totalTime: 25,
        ingredientLines: ['500g csirkemell', '2 paprika', '1 hagyma', '2 ek fajita fűszer', '4 tortilla'],
        cuisineType: ['mexikói'],
        mealType: ['vacsora'],
        dishType: ['fajitas'],
        dietLabels: [],
        healthLabels: [],
      }
    },
    {
      recipe: {
        uri: 'fallback-15',
        label: 'Csirke teriyaki',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 4,
        calories: 350,
        totalTime: 30,
        ingredientLines: ['500g csirkemell', '3 ek teriyaki szósz', '1 ek méz', '2 gerezd fokhagyma', '1 ek olaj'],
        cuisineType: ['japán'],
        mealType: ['vacsora'],
        dishType: ['teriyaki'],
        dietLabels: [],
        healthLabels: [],
      }
    },
    {
      recipe: {
        uri: 'fallback-16',
        label: 'Buffalo csirke szárnyak',
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 4,
        calories: 320,
        totalTime: 40,
        ingredientLines: ['1kg csirke szárnyak', '1/2 csésze buffalo szósz', '2 ek vaj', '1 tk fokhagymapor'],
        cuisineType: ['amerikai'],
        mealType: ['uzsonna'],
        dishType: ['szárnyak'],
        dietLabels: [],
        healthLabels: ['gluténmentes'],
      }
    },
    {
      recipe: {
        uri: 'fallback-17',
        label: 'Csirke enchiladas',
        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 6,
        calories: 450,
        totalTime: 50,
        ingredientLines: ['500g főtt csirke', '8 tortilla', '2 csésze enchilada szósz', '1 csésze sajt', '1 hagyma'],
        cuisineType: ['mexikói'],
        mealType: ['vacsora'],
        dishType: ['enchiladas'],
        dietLabels: [],
        healthLabels: [],
      }
    },
    {
      recipe: {
        uri: 'fallback-18',
        label: 'Csirke shawarma',
        image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=300&h=200&fit=crop',
        source: 'Házi recept',
        url: '',
        yield: 4,
        calories: 390,
        totalTime: 35,
        ingredientLines: ['600g csirkemell', '2 ek shawarma fűszer', '4 pita kenyér', '1 uborka', 'tzatziki szósz'],
        cuisineType: ['közel-keleti'],
        mealType: ['ebéd'],
        dishType: ['shawarma'],
        dietLabels: [],
        healthLabels: [],
      }
    }
  ];

  const filteredRecipes = mockRecipes.filter(hit => 
    hit.recipe.label.toLowerCase().includes(query.toLowerCase()) ||
    hit.recipe.ingredientLines.some(ingredient => 
      ingredient.toLowerCase().includes(query.toLowerCase())
    )
  );

  return {
    hits: filteredRecipes.length > 0 ? filteredRecipes : mockRecipes
  };
}
