import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    if (req.method === 'GET') {
      console.log('GET /api/recipes - Session user ID:', session.user.id);
      console.log('Session user object:', session.user);
      
      const { search, tags, mealType, limit = '20' } = req.query;
      
      let query: any = {
        userId: session.user.id, // Only get recipes for the current user
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

      console.log('Session user ID:', session.user.id);

      const recipeData = {
        userId: session.user.id,
        title,
        ingredients,
        steps: steps || [],
        caloriesPerServing,
        servings: servings || 1,
        tags: tags || [],
        imageUrl,
        prepTime,
        cookTime,
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
      console.log('User ID:', session.user.id);

      const recipe = await Recipe.findOneAndDelete({
        _id: id,
        userId: session.user.id, // Only allow deleting own recipes
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

      console.log('Updating recipe with ID:', id);
      console.log('Update data:', req.body);

      const recipe = await Recipe.findOneAndUpdate(
        {
          _id: id,
          userId: session.user.id, // Only allow updating own recipes
        },
        {
          title,
          ingredients,
          steps: steps || [],
          caloriesPerServing,
          servings: servings || 1,
          tags: tags || [],
          imageUrl,
          prepTime,
          cookTime,
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

