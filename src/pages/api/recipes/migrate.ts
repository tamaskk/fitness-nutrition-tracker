import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    if (req.method === 'POST') {
      console.log('Migration - Session user ID:', session.user.id);
      
      // First, let's see what recipes exist without userId
      const recipesWithoutUserId = await Recipe.find({ userId: { $exists: false } });
      console.log('Recipes without userId:', recipesWithoutUserId.length);
      console.log('Sample recipe:', recipesWithoutUserId[0]);
      
      // Also check for recipes with undefined/null userId
      const recipesWithUndefinedUserId = await Recipe.find({ userId: undefined });
      console.log('Recipes with undefined userId:', recipesWithUndefinedUserId.length);
      
      const recipesWithNullUserId = await Recipe.find({ userId: null });
      console.log('Recipes with null userId:', recipesWithNullUserId.length);
      
      // Update all recipes that don't have a valid userId
      // Since the field doesn't exist, we'll update all recipes and then filter
      const allRecipes = await Recipe.find({});
      console.log('Total recipes in database:', allRecipes.length);
      
      // Update all recipes to have userId
      const result = await Recipe.updateMany(
        {},
        { $set: { userId: session.user.id } }
      );

      console.log('Migration result:', result);
      
      // Verify the update worked
      const updatedRecipes = await Recipe.find({ userId: session.user.id });
      console.log('Recipes with userId after migration:', updatedRecipes.length);

      res.status(200).json({
        message: 'Migration completed',
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
        sessionUserId: session.user.id
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
