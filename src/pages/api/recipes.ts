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
      const { search, tags, mealType, limit = '20' } = req.query;
      
      let query: any = {};
      
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

      const recipes = await Recipe.find(query)
        .limit(parseInt(limit as string))
        .sort({ createdAt: -1 });

      res.status(200).json(recipes);
    } else if (req.method === 'POST') {
      const { 
        title, 
        ingredients, 
        steps, 
        caloriesPerServing, 
        servings, 
        tags, 
        imageUrl, 
        prepTime, 
        cookTime 
      } = req.body;

      if (!title || !ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ message: 'Title and ingredients are required' });
      }

      const recipe = await Recipe.create({
        title,
        ingredients,
        steps: steps || [],
        caloriesPerServing,
        servings: servings || 1,
        tags: tags || [],
        imageUrl,
        prepTime,
        cookTime,
      });

      res.status(201).json(recipe);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Recipes API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

