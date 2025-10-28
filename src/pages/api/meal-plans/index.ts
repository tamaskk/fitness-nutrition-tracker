import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/mongodb';
import MealPlan from '@/models/MealPlan';
import Recipe from '@/models/Recipe';
import OpenAI from 'openai';
import { getUserFromToken } from '@/utils/auth';
import User from '@/models/User';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 50000,
});

export const config = {
  maxDuration: 60,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const userId = user._id as string;

    await connectDB();

    switch (req.method) {
      case 'GET':
        return handleGet(req, res, userId.toString());
      case 'POST':
        return handleCreate(req, res, userId.toString());
      case 'PUT':
        return handleUpdate(req, res, userId.toString());
      case 'DELETE':
        return handleDelete(req, res, userId.toString());
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Meal plan API error:', error);
    
    // Check if it's a timeout error
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        return res.status(504).json({ 
          success: false,
          error: error.message,
          code: 'TIMEOUT'
        });
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false,
      error: errorMessage 
    });
  }
}

// GET - Fetch meal plans
async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id, active, populate } = req.query;

  try {
    if (id) {
      // Get single meal plan
      let query = MealPlan.findOne({ _id: id, userId });
      
      if (populate === 'true') {
        query = query.populate('days.meals.recipeId');
      }
      
      const mealPlan = await query.exec();
      
      if (!mealPlan) {
        return res.status(404).json({ error: 'Meal plan not found' });
      }
      
      return res.status(200).json({ success: true, mealPlan });
    }

    // Get all meal plans
    const filter: any = { userId };
    if (active === 'true') {
      filter.isActive = true;
    }

    let query = MealPlan.find(filter).sort({ startDate: -1 });
    
    if (populate === 'true') {
      query = query.populate('days.meals.recipeId');
    }

    const mealPlans = await query.exec();

    return res.status(200).json({ success: true, mealPlans });
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    throw error;
  }
}

// POST - Create new meal plan with OpenAI
async function handleCreate(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const {
    name,
    description,
    type = 'weekly',
    startDate,
    preferences = {},
    generateWithAI = true,
  } = req.body;

  if (!name || !startDate) {
    return res.status(400).json({ error: 'Name and start date are required' });
  }

  try {
    // Calculate number of days based on type
    const daysCount = type === 'daily' ? 1 : type === 'weekly' ? 7 : type === 'monthly' ? 30 : 7;
    
    // Limit to prevent timeouts (max 3 days per AI generation)
    const maxDaysPerGeneration = 3;
    
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + daysCount - 1);

    let days = [];

    if (generateWithAI) {
      // Generate meal plan one day at a time, passing previous days for context
      console.log(`Generating ${daysCount} day meal plan...`);
      
      for (let dayIndex = 0; dayIndex < daysCount; dayIndex++) {
        console.log(`Generating day ${dayIndex + 1}/${daysCount}...`);
        
        try {
          const aiResponse = await generateMealPlanWithAI(
            1, // Always generate 1 day at a time
            preferences,
            userId,
            dayIndex,
            start,
            days // Pass previously generated days for context
          );
          
          days.push(...aiResponse.days);
        } catch (error) {
          console.error(`Error generating day ${dayIndex + 1}:`, error);
          
          // If timeout or error, throw with helpful message
          if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('timed out'))) {
            throw new Error(`AI generation timed out on day ${dayIndex + 1}/${daysCount}. Try simplifying preferences.`);
          }
          throw error;
        }
      }
    } else {
      // Create empty days structure
      days = Array.from({ length: daysCount }, (_, i) => {
        const dayDate = new Date(start);
        dayDate.setDate(dayDate.getDate() + i);
        
        return {
          dayNumber: i + 1,
          date: dayDate,
          meals: [],
        };
      });
    }

    const mealPlan = new MealPlan({
      userId,
      name,
      description,
      type,
      startDate: start,
      endDate,
      days,
      preferences,
      isActive: true,
    });

    await mealPlan.save();

    // Populate recipes before sending response
    await mealPlan.populate('days.meals.recipeId');

    return res.status(201).json({
      success: true,
      message: 'Meal plan created successfully',
      mealPlan,
    });
  } catch (error) {
    console.error('Error creating meal plan:', error);
    throw error;
  }
}

// PUT - Update meal plan
async function handleUpdate(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Meal plan ID is required' });
  }

  try {
    const mealPlan = await MealPlan.findOne({ _id: id, userId });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'days', 'preferences', 'isActive'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        (mealPlan as any)[field] = updates[field];
      }
    });

    await mealPlan.save();
    await mealPlan.populate('days.meals.recipeId');

    return res.status(200).json({
      success: true,
      message: 'Meal plan updated successfully',
      mealPlan,
    });
  } catch (error) {
    console.error('Error updating meal plan:', error);
    throw error;
  }
}

// DELETE - Delete meal plan
async function handleDelete(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Meal plan ID is required' });
  }

  try {
    const mealPlan = await MealPlan.findOneAndDelete({ _id: id, userId });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Meal plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    throw error;
  }
}

// Helper function to generate meal plan with OpenAI
async function generateMealPlanWithAI(
  daysCount: number,
  preferences: any,
  userId: string,
  startDayOffset: number = 0,
  planStartDate: Date,
  previousDays: any[] = []
) {
  const {
    dislikes = [],
    excludedIngredients = [],
    allergies = [],
    dietaryRestrictions = [],
    calorieTarget,
    proteinTarget,
  } = preferences;

  // Build prompt based on preferences
  const dislikesText = dislikes.length > 0 ? `\n- KERÜLNI: ${dislikes.join(', ')}` : '';
  const excludedText = excludedIngredients.length > 0 ? `\n- TILTOTT HOZZÁVALÓK: ${excludedIngredients.join(', ')}` : '';
  const allergiesText = allergies.length > 0 ? `\n- ALLERGIÁK: ${allergies.join(', ')}` : '';
  const dietaryText = dietaryRestrictions.length > 0 ? `\n- DIÉTÁS MEGSZORÍTÁSOK: ${dietaryRestrictions.join(', ')}` : '';
  const calorieText = calorieTarget ? `\n- NAPI KALÓRIA CÉL: ${calorieTarget} kcal` : '';
  const proteinText = proteinTarget ? `\n- NAPI FEHÉRJE CÉL: ${proteinTarget}g` : '';

  // Build context from previous days to ensure variety
  let previousMealsContext = '';
  if (previousDays.length > 0) {
    const previousMeals = previousDays.flatMap(day => 
      day.meals.map((meal: any) => meal.recipeTitle || meal.recipe?.title || 'Unknown meal')
    );
    console.log(`📋 Previous meals (${previousMeals.length}):`, previousMeals.join(', '));
    previousMealsContext = `\n\nEDDIG GENERÁLT ÉTELEK (TILOS ISMÉTELNI - HASZNÁLJ MÁS RECEPTEKET!):\n${previousMeals.join(', ')}\n\nFONTOS: Ezeket az ételeket MÁR HASZNÁLTUK! Generálj TELJESEN KÜLÖNBÖZŐ recepteket!`;
  }

  const dayNumberText = previousDays.length > 0 ? `${startDayOffset + 1}. NAP` : 'NAP';

  const prompt = `Készíts 1 nap (${dayNumberText}) étrendet. Minden nap: reggeli, ebéd, vacsora, desszert.
${dislikesText}${excludedText}${allergiesText}${dietaryText}${calorieText}${proteinText}${previousMealsContext}

JSON formátum:
{
  "days": [
    {
      "dayNumber": 1,
      "meals": [
        {
          "mealType": "breakfast",
          "recipe": {
            "title": "Név",
            "description": "Leírás",
            "ingredients": [{"name": "X", "amount": "100", "unit": "g"}],
            "instructions": [
              {
                "step": "Mit kell csinálni ebben a lépésben",
                "ingredient": "Az ehhez szükséges hozzávalók (pl. '100g liszt, 2 tojás')"
              }
            ],
            "caloriesPerServing": 350,
            "proteinPerServing": 20,
            "carbsPerServing": 30,
            "fatPerServing": 10,
            "fiberPerServing": 5,
            "servings": 2,
            "cookingTime": "30",
            "category": "reggeli",
            "difficulty": "Könnyű",
            "tags": ["tag"]
          }
        }
      ]
    }
  ]
}

FONTOS SZABÁLYOK: 
- 1 nap, 4 étkezés (breakfast, lunch, dinner, dessert)
- Rövid, tömör receptek
${previousDays.length > 0 ? '- ⚠️ KRITIKUS: NE GENERÁLD újra a fenti ételeket! MINDEN receptnek TELJESEN ÚJNAK kell lennie!\n- Használj TELJESEN MÁS alapanyagokat (pl. ha volt csirke, használj halat vagy vegetáriánus opciót)\n- MÁS főzési módszer (ha volt sült, legyen főtt, grillezett vagy párolt)\n- MÁS konyhát (pl. ázsiai, mediterrán, mexikói stb.)\n- SOHA ne ismételd meg egy korábbi recept címét vagy fő összetevőjét!' : '- Légy változatos és kreatív!'}
- A 4 receptnek TELJESEN KÜLÖNBÖZŐNEK kell lennie egymástól is!`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Táplálkozási tanácsadó. JSON válasz magyarul. KRITIKUS: Ha kapsz listát korábbi ételekről, SOHA ne ismételd őket! Minden receptnek TELJESEN ÚJNAK és EGYEDINEK kell lennie. Variálj alapanyagokban, főzési módszerekben és konyhákban. FONTOS: Az 'instructions' tömb elemei objektumok legyenek 'step' (utasítás) és 'ingredient' (hozzávalók) mezőkkel!"
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 3000, // Reduced for faster response
    temperature: 0.8, // Higher for more creativity and variety
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content received from OpenAI');
  }

  const aiData = JSON.parse(content);

  console.log('aiData', JSON.stringify(aiData, null, 2));
  
  // Process the AI response and create/save recipes
  const processedDays = await Promise.all(
    aiData.days.map(async (day: any, dayIndex: number) => {
      const dayDate = new Date(planStartDate);
      dayDate.setDate(dayDate.getDate() + startDayOffset + dayIndex);

      const processedMeals = await Promise.all(
        day.meals.map(async (meal: any) => {
          // Create or find recipe
          const recipeData = {
            userId,
            title: meal.recipe.title,
            externalId: `ai-meal-plan-${Date.now()}-${Math.random()}`,
            ingredients: meal.recipe.ingredients.map((ing: any) => ({
              name: ing.name,
              quantity: `${ing.amount} ${ing.unit}`,
              grams: 0,
            })),
            steps: meal.recipe.instructions || [],
            caloriesPerServing: meal.recipe.caloriesPerServing || 0,
            servings: meal.recipe.servings || 1,
            prepTime: parseInt(meal.recipe.cookingTime) || 30,
            cookTime: parseInt(meal.recipe.cookingTime) || 30,
            category: meal.recipe.category || meal.mealType,
            tags: meal.recipe.tags || [],
            imageUrl: null,
          };

          const recipe = new Recipe(recipeData);
          await recipe.save();

          return {
            recipeId: recipe._id,
            recipeTitle: meal.recipe.title, // Store title for context
            mealType: meal.mealType,
            completed: false,
            notes: '',
          };
        })
      );

      return {
        dayNumber: startDayOffset + dayIndex + 1,
        date: dayDate,
        meals: processedMeals,
      };
    })
  );

  return { days: processedDays };
}

