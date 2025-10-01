import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Te egy professzionális szakács és recept alkotó vagy. Készíts részletes, praktikus recepteket a felhasználói kérések alapján. 

MINDIG magyar nyelven válaszolj, és MINDIG JSON objektumot adj vissza ebben a pontos formátumban:
{
  "title": "Recept neve",
  "description": "Rövid leírás az ételről",
  "servings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "totalTime": 45,
  "difficulty": "Könnyű|Közepes|Nehéz",
  "cuisine": "konyha típusa",
  "mealType": "reggeli|ebéd|vacsora|uzsonna",
  "ingredients": [
    {
      "name": "hozzávaló neve",
      "quantity": "mennyiség",
      "notes": "opcionális előkészítési megjegyzések"
    }
  ],
  "instructions": [
    "1. lépés utasítás",
    "2. lépés utasítás"
  ],
  "nutritionEstimate": {
    "calories": 350,
    "protein": 25,
    "carbs": 30,
    "fat": 15,
    "fiber": 5
  },
  "tips": [
    "Hasznos főzési tipp 1",
    "Hasznos főzési tipp 2"
  ],
  "tags": ["címke1", "címke2", "címke3"]
}

Győződj meg róla, hogy a recept praktikus, általános hozzávalókat használ, és világos, lépésről lépésre szóló utasításokat tartalmaz. Adj reális táplálkozási becsléseket és hasznos főzési tippeket. MINDEN szöveget magyar nyelven írj!`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const recipeContent = data.choices[0]?.message?.content;

    if (!recipeContent) {
      throw new Error('No recipe content received from AI');
    }

    // Parse the JSON response
    let recipe;
    try {
      recipe = JSON.parse(recipeContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', recipeContent);
      throw new Error('Invalid recipe format received from AI');
    }

    // Validate the recipe structure
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error('Incomplete recipe received from AI');
    }

    // Add metadata for our app
    const formattedRecipe = {
      ...recipe,
      uri: `ai-generated-${Date.now()}`,
      label: recipe.title,
      image: null, // AI doesn't generate images
      imageUrl: null, // For recipe model compatibility
      calories: recipe.nutritionEstimate?.calories || 0,
      caloriesPerServing: recipe.nutritionEstimate?.calories || 0, // Add this for RecipeCard compatibility
      yield: recipe.servings || 4,
      steps: recipe.instructions,
      cuisineType: [recipe.cuisine?.toLowerCase() || 'international'],
      mealType: [recipe.mealType?.toLowerCase() || 'main'],
      tags: recipe.tags || [],
      isAIGenerated: true,
      generatedAt: new Date().toISOString(),
    };

    res.status(200).json(formattedRecipe);
  } catch (error) {
    console.error('Error generating recipe:', error);
    
    // Return a fallback recipe if AI fails
    const fallbackRecipe = {
      uri: `fallback-${Date.now()}`,
      title: 'Egyszerű tészta fokhagymával és olajjal',
      label: 'Egyszerű tészta fokhagymával és olajjal',
      description: 'Klasszikus olasz tészta étel, ami gyors és finom',
      image: null,
      servings: 4,
      prepTime: 5,
      cookTime: 15,
      totalTime: 20,
      difficulty: 'Könnyű',
      cuisine: 'Olasz',
      mealType: 'vacsora',
      ingredients: [
        { name: 'Spagetti', quantity: '400g', notes: '' },
        { name: 'Fokhagyma', quantity: '4 gerezd', notes: 'aprítva' },
        { name: 'Olívaolaj', quantity: '1/3 csésze', notes: 'extra szűz' },
        { name: 'Pirospaprika pehely', quantity: '1/2 tk', notes: 'opcionális' },
        { name: 'Parmezán sajt', quantity: '1/2 csésze', notes: 'reszelt' },
        { name: 'Friss petrezselyem', quantity: '2 ek', notes: 'aprítva' },
        { name: 'Só', quantity: 'ízlés szerint', notes: '' },
        { name: 'Fekete bors', quantity: 'ízlés szerint', notes: 'frissen őrölt' }
      ],
      instructions: [
        'Forrald fel a sós vizet egy nagy lábasban és főzd meg a spagettit a csomagoláson található utasítás szerint',
        'Amíg a tészta fő, melegítsd fel az olívaolajat egy nagy serpenyőben közepes lángon',
        'Add hozzá az aprított fokhagymát és a pirospaprika pelyhet, főzd 1-2 percig, amíg illatos lesz',
        'Tarts meg 1 csésze tésztavizet, majd szűrd le a tésztát',
        'Add a leszűrt tésztát a fokhagymás olajos serpenyőbe',
        'Keverd össze tésztavízzel, szükség szerint, hogy selymes szószt készíts',
        'Vedd le a tűzről, add hozzá a parmezánt és a petrezselymet',
        'Ízesítsd sóval és borssal, azonnal tálald'
      ],
      steps: [
        'Forrald fel a sós vizet egy nagy lábasban és főzd meg a spagettit a csomagoláson található utasítás szerint',
        'Amíg a tészta fő, melegítsd fel az olívaolajat egy nagy serpenyőben közepes lángon',
        'Add hozzá az aprított fokhagymát és a pirospaprika pelyhet, főzd 1-2 percig, amíg illatos lesz',
        'Tarts meg 1 csésze tésztavizet, majd szűrd le a tésztát',
        'Add a leszűrt tésztát a fokhagymás olajos serpenyőbe',
        'Keverd össze tésztavízzel, szükség szerint, hogy selymes szószt készíts',
        'Vedd le a tűzről, add hozzá a parmezánt és a petrezselymet',
        'Ízesítsd sóval és borssal, azonnal tálald'
      ],
      imageUrl: null, // For recipe model compatibility
      calories: 420,
      caloriesPerServing: 420, // Add this for RecipeCard compatibility
      yield: 4,
      nutritionEstimate: {
        calories: 420,
        protein: 12,
        carbs: 65,
        fat: 14,
        fiber: 3
      },
      tips: [
        'Ne hagyd megbarnulni a fokhagymát, mert keserű lesz',
        'Tarts meg egy kevés tésztavizet - a keményítő segít krémes szószt készíteni',
        'Használj jó minőségű olívaolajat a legjobb ízért'
      ],
      cuisineType: ['olasz'],
      mealType: ['vacsora'],
      tags: ['tészta', 'olasz', 'gyors', 'vegetáriánus'],
      isAIGenerated: true,
      isFallback: true,
      generatedAt: new Date().toISOString(),
    };

    res.status(200).json(fallbackRecipe);
  }
}
