import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { getUserFromToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

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


    if (req.method === 'GET') {
      console.log('GET /api/recipes - Session user ID:', userId);
      
      const { search, tags, mealType, limit = '20' } = req.query;
      
      let query: any = {
        userId: userId, // Only get recipes for the current user
      };
      
      console.log('Query for recipes:', query);
      
      // Text search
      if (search && typeof search === 'string') {
        query.$text = { $search: search };
      }
      
      // Filter by tags
      if (tags && typeof tags === 'string') {
        const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
        query.tags = { $in: tagArray };
      }
      
      // Filter by meal type
      if (mealType && typeof mealType === 'string') {
        query.tags = { ...query.tags, $in: [...(query.tags?.$in || []), mealType.toLowerCase()] };
      }

      console.log('Final query:', query);

      const recipes = await Recipe.find(query)
        .limit(parseInt(limit as string))
        .sort({ createdAt: -1 });

      console.log('Found recipes:', recipes.length);
      console.log('Recipes:', recipes);

      // Debug: Check all recipes in database
      const allRecipes = await Recipe.find({});
      console.log('All recipes in database:', allRecipes.length);
      console.log('All recipes:', allRecipes.map(r => ({ id: r._id, userId: r.userId, title: r.title })));

      res.status(200).json(recipes);
    } else if (req.method === 'POST') {
      console.log('POST /api/recipes - Request body:', req.body);
      
      const { 
        title, 
        ingredients, 
        steps, 
        caloriesPerServing,
        proteinPerServing,
        carbsPerServing,
        fatPerServing,
        fiberPerServing,
        macroNutrients,
        microNutrients,
        servings, 
        tags, 
        imageUrl, 
        prepTime, 
        cookTime,
        category
      } = req.body;

      console.log('Extracted fields:', {
        title,
        ingredients,
        steps,
        caloriesPerServing,
        proteinPerServing,
        carbsPerServing,
        fatPerServing,
        fiberPerServing,
        macroNutrients,
        microNutrients,
        servings,
        tags,
        imageUrl,
        prepTime,
        cookTime,
        category
      });

      if (!title || !ingredients || !Array.isArray(ingredients)) {
        console.log('Validation failed:', { title, ingredients, isArray: Array.isArray(ingredients) });
        return res.status(400).json({ message: 'Title and ingredients are required' });
      }

      console.log('Session user ID:', userId);

      // Helper function to convert time string to number
      const parseTimeToMinutes = (timeValue: any): number => {
        if (typeof timeValue === 'number') {
          return timeValue;
        }
        if (typeof timeValue === 'string') {
          // Extract number from strings like "50 perc", "30 minutes", "1 óra"
          const match = timeValue.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }
        return 0;
      };

      // Helper function to normalize steps format (handle both old and new formats)
      const normalizeSteps = (steps: any[]): Array<{ step: string; ingredient: string }> => {
        if (!steps || !Array.isArray(steps)) return [];
        
        return steps.map((stepItem) => {
          // New format: object with step and ingredient
          if (typeof stepItem === 'object' && stepItem.step) {
            return {
              step: stepItem.step,
              ingredient: stepItem.ingredient || '', // Default to empty string if not provided
            };
          }
          // Old format: plain string
          if (typeof stepItem === 'string') {
            return {
              step: stepItem,
              ingredient: '', // No ingredient info in old format
            };
          }
          // Fallback for unexpected format
          return {
            step: String(stepItem),
            ingredient: '',
          };
        });
      };

      const recipeData = {
        userId: userId,
        title,
        ingredients,
        steps: normalizeSteps(steps || []),
        caloriesPerServing: caloriesPerServing || 0,
        proteinPerServing: proteinPerServing || 0,
        carbsPerServing: carbsPerServing || 0,
        fatPerServing: fatPerServing || 0,
        fiberPerServing: fiberPerServing || 0,
        macroNutrients: macroNutrients || undefined,
        microNutrients: microNutrients || undefined,
        servings: servings || 1,
        tags: tags || [],
        imageUrl,
        prepTime: parseTimeToMinutes(prepTime),
        cookTime: parseTimeToMinutes(cookTime),
        category,
      };

      console.log('Recipe data:', recipeData);

      console.log('Creating recipe with data:', recipeData);
      console.log('RecipeData userId type:', typeof recipeData.userId);
      console.log('RecipeData userId value:', recipeData.userId);

      const recipe = await Recipe.create(recipeData);

      console.log('Recipe created successfully:', recipe);
      console.log('Created recipe userId:', recipe.userId);
      console.log('Created recipe userId type:', typeof recipe.userId);
      res.status(201).json(recipe);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Recipe ID is required' });
      }

      console.log('Deleting recipe with ID:', id);
      console.log('User ID:', userId);

      const recipe = await Recipe.findOneAndDelete({
        _id: id,
        userId: userId, // Only allow deleting own recipes
      });

      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found or unauthorized' });
      }

      console.log('Recipe deleted successfully:', recipe.title);
      res.status(200).json({ message: 'Recipe deleted successfully' });
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Recipe ID is required' });
      }

      const { 
        title, 
        ingredients, 
        steps, 
        caloriesPerServing,
        proteinPerServing,
        carbsPerServing,
        fatPerServing,
        fiberPerServing,
        macroNutrients,
        microNutrients,
        servings, 
        tags, 
        imageUrl, 
        prepTime, 
        cookTime,
        category
      } = req.body;

      if (!title || !ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ message: 'Title and ingredients are required' });
      }

      // Helper function to convert time string to number
      const parseTimeToMinutes = (timeValue: any): number => {
        if (typeof timeValue === 'number') {
          return timeValue;
        }
        if (typeof timeValue === 'string') {
          // Extract number from strings like "50 perc", "30 minutes", "1 óra"
          const match = timeValue.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }
        return 0;
      };

      // Helper function to normalize steps format (handle both old and new formats)
      const normalizeSteps = (steps: any[]): Array<{ step: string; ingredient: string }> => {
        if (!steps || !Array.isArray(steps)) return [];
        
        return steps.map((stepItem) => {
          // New format: object with step and ingredient
          if (typeof stepItem === 'object' && stepItem.step) {
            return {
              step: stepItem.step,
              ingredient: stepItem.ingredient || '', // Default to empty string if not provided
            };
          }
          // Old format: plain string
          if (typeof stepItem === 'string') {
            return {
              step: stepItem,
              ingredient: '', // No ingredient info in old format
            };
          }
          // Fallback for unexpected format
          return {
            step: String(stepItem),
            ingredient: '',
          };
        });
      };

      console.log('Updating recipe with ID:', id);
      console.log('Update data:', req.body);

      const recipe = await Recipe.findOneAndUpdate(
        {
          _id: id,
          userId: userId, // Only allow updating own recipes
        },
        {
          title,
          ingredients,
          steps: normalizeSteps(steps || []),
          caloriesPerServing: caloriesPerServing || 0,
          proteinPerServing: proteinPerServing || 0,
          carbsPerServing: carbsPerServing || 0,
          fatPerServing: fatPerServing || 0,
          fiberPerServing: fiberPerServing || 0,
          macroNutrients: macroNutrients || undefined,
          microNutrients: microNutrients || undefined,
          servings: servings || 1,
          tags: tags || [],
          imageUrl,
          prepTime: parseTimeToMinutes(prepTime),
          cookTime: parseTimeToMinutes(cookTime),
          category,
        },
        { new: true, runValidators: true }
      );

      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found or unauthorized' });
      }

      console.log('Recipe updated successfully:', recipe.title);
      res.status(200).json(recipe);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Recipes API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

