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

  const { q: query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    // Use Edamam Food Database API for nutrition data
    const appId = process.env.EDAMAM_FOOD_APP_ID;
    const appKey = process.env.EDAMAM_FOOD_APP_KEY;

    if (!appId || !appKey) {
      console.warn('Edamam credentials not found, using fallback data');
      return res.status(200).json(getFallbackFoodData(query));
    }

    // Edamam Food Database API endpoint for food search
    const edamamUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${encodeURIComponent(query)}&nutrition-type=cooking`;

    const response = await fetch(edamamUrl);
    
    if (!response.ok) {
      throw new Error(`Edamam API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Convert Edamam response to our format
    const foods = data.parsed?.map((item: any) => ({
      id: item.food.foodId,
      name: item.food.label,
      caloriesPer100g: Math.round(item.food.nutrients?.ENERC_KCAL || 0),
      proteinPer100g: Math.round((item.food.nutrients?.PROCNT || 0) * 10) / 10,
      carbsPer100g: Math.round((item.food.nutrients?.CHOCDF || 0) * 10) / 10,
      fatPer100g: Math.round((item.food.nutrients?.FAT || 0) * 10) / 10,
      fiberPer100g: Math.round((item.food.nutrients?.FIBTG || 0) * 10) / 10,
      brand: item.food.brand || null,
      category: item.food.category || 'Unknown',
      image: item.food.image || null,
    })) || [];

    // Also include hints (additional food suggestions)
    const hints = data.hints?.slice(0, 10)?.map((item: any) => ({
      id: item.food.foodId,
      name: item.food.label,
      caloriesPer100g: Math.round(item.food.nutrients?.ENERC_KCAL || 0),
      proteinPer100g: Math.round((item.food.nutrients?.PROCNT || 0) * 10) / 10,
      carbsPer100g: Math.round((item.food.nutrients?.CHOCDF || 0) * 10) / 10,
      fatPer100g: Math.round((item.food.nutrients?.FAT || 0) * 10) / 10,
      fiberPer100g: Math.round((item.food.nutrients?.FIBTG || 0) * 10) / 10,
      brand: item.food.brand || null,
      category: item.food.category || 'Unknown',
      image: item.food.image || null,
    })) || [];

    // Combine parsed and hints, remove duplicates
    const allFoods = [...foods, ...hints];
    const uniqueFoods = allFoods.filter((food, index, self) => 
      index === self.findIndex(f => f.id === food.id)
    );

    res.status(200).json(uniqueFoods.slice(0, 15)); // Limit to 15 results
  } catch (error) {
    console.error('Edamam API error:', error);
    // Return fallback data if API fails
    res.status(200).json(getFallbackFoodData(query));
  }
}

// Fallback food data when API is unavailable
function getFallbackFoodData(query: string) {
  const mockFoods = [
    { id: 1, name: 'Csirkemell', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, brand: null, category: 'Hús', image: null },
    { id: 2, name: 'Barna rizs', caloriesPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9, fiberPer100g: 1.8, brand: null, category: 'Gabona', image: null },
    { id: 3, name: 'Brokkoli', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 2.6, brand: null, category: 'Zöldség', image: null },
    { id: 4, name: 'Lazac filé', caloriesPer100g: 208, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 12, fiberPer100g: 0, brand: null, category: 'Hal', image: null },
    { id: 5, name: 'Görög joghurt', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 0, brand: null, category: 'Tejtermék', image: null },
    { id: 6, name: 'Banán', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, fiberPer100g: 2.6, brand: null, category: 'Gyümölcs', image: null },
    { id: 7, name: 'Mandula', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, fiberPer100g: 12, brand: null, category: 'Dió', image: null },
    { id: 8, name: 'Édesburgonya', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, fiberPer100g: 3, brand: null, category: 'Zöldség', image: null },
    { id: 9, name: 'Tojás', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0, brand: null, category: 'Protein', image: null },
    { id: 10, name: 'Avokádó', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15, fiberPer100g: 7, brand: null, category: 'Gyümölcs', image: null },
  ];

  return mockFoods.filter(food => 
    food.name.toLowerCase().includes(query.toLowerCase())
  );
}

