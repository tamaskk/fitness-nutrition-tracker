import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { barcode } = req.body;

    if (!barcode || typeof barcode !== 'string') {
      return res.status(400).json({ message: 'Barcode is required' });
    }

    // Check if we have external API credentials
    const nutritionApiKey = process.env.NUTRITIONIX_API_KEY;
    const nutritionAppId = process.env.NUTRITIONIX_APP_ID;

    if (!nutritionApiKey || !nutritionAppId) {
      // Return mock data for development/demo
      const mockBarcodeData = {
        '012345678901': {
          name: 'Organic Banana',
          brand: 'Fresh & Natural',
          caloriesPer100g: 89,
          proteinPer100g: 1.1,
          carbsPer100g: 23,
          fatPer100g: 0.3,
          servingSize: '1 medium (118g)',
          ingredients: ['Organic Banana'],
        },
        '123456789012': {
          name: 'Greek Yogurt Plain',
          brand: 'Healthy Choice',
          caloriesPer100g: 59,
          proteinPer100g: 10,
          carbsPer100g: 3.6,
          fatPer100g: 0.4,
          servingSize: '1 cup (245g)',
          ingredients: ['Cultured Grade A Nonfat Milk', 'Live Active Cultures'],
        },
        '234567890123': {
          name: 'Whole Wheat Bread',
          brand: 'Artisan Bakery',
          caloriesPer100g: 247,
          proteinPer100g: 13,
          carbsPer100g: 41,
          fatPer100g: 4.2,
          servingSize: '1 slice (28g)',
          ingredients: ['Whole Wheat Flour', 'Water', 'Yeast', 'Salt', 'Honey'],
        },
        '345678901234': {
          name: 'Almond Milk Unsweetened',
          brand: 'Plant Based',
          caloriesPer100g: 15,
          proteinPer100g: 0.6,
          carbsPer100g: 0.6,
          fatPer100g: 1.2,
          servingSize: '1 cup (240ml)',
          ingredients: ['Almondmilk (Filtered Water, Almonds)', 'Sea Salt', 'Locust Bean Gum', 'Sunflower Lecithin', 'Gellan Gum', 'Natural Flavor'],
        }
      };

      const product = mockBarcodeData[barcode as keyof typeof mockBarcodeData];
      
      if (product) {
        return res.status(200).json({
          found: true,
          product: {
            ...product,
            barcode,
          }
        });
      } else {
        return res.status(200).json({
          found: false,
          message: 'Product not found in database',
          barcode,
        });
      }
    }

    // Real API integration with Nutritionix or OpenFoodFacts
    try {
      // Try OpenFoodFacts first (free API)
      const openFoodFactsResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      
      if (openFoodFactsResponse.ok) {
        const data = await openFoodFactsResponse.json();
        
        if (data.status === 1 && data.product) {
          const product = data.product;
          
          return res.status(200).json({
            found: true,
            product: {
              name: product.product_name || 'Unknown Product',
              brand: product.brands || '',
              caloriesPer100g: product.nutriments?.['energy-kcal_100g'] || 0,
              proteinPer100g: product.nutriments?.proteins_100g || 0,
              carbsPer100g: product.nutriments?.carbohydrates_100g || 0,
              fatPer100g: product.nutriments?.fat_100g || 0,
              servingSize: product.serving_size || '',
              ingredients: product.ingredients_text_en?.split(', ') || [],
              barcode,
            }
          });
        }
      }

      // Fallback to Nutritionix API if available
      const nutritionixResponse = await fetch(`https://trackapi.nutritionix.com/v2/search/item?upc=${barcode}`, {
        headers: {
          'x-app-id': nutritionAppId,
          'x-app-key': nutritionApiKey,
          'Content-Type': 'application/json',
        },
      });

      if (nutritionixResponse.ok) {
        const data = await nutritionixResponse.json();
        
        if (data.foods && data.foods.length > 0) {
          const food = data.foods[0];
          
          return res.status(200).json({
            found: true,
            product: {
              name: food.food_name || 'Unknown Product',
              brand: food.brand_name || '',
              caloriesPer100g: Math.round((food.nf_calories / food.serving_weight_grams) * 100),
              proteinPer100g: Math.round((food.nf_protein / food.serving_weight_grams) * 100),
              carbsPer100g: Math.round((food.nf_total_carbohydrate / food.serving_weight_grams) * 100),
              fatPer100g: Math.round((food.nf_total_fat / food.serving_weight_grams) * 100),
              servingSize: `${food.serving_qty} ${food.serving_unit}`,
              ingredients: [],
              barcode,
            }
          });
        }
      }

      // Product not found in any API
      return res.status(200).json({
        found: false,
        message: 'Product not found in nutrition databases',
        barcode,
      });

    } catch (apiError) {
      console.error('Barcode API error:', apiError);
      return res.status(200).json({
        found: false,
        message: 'Error looking up product information',
        barcode,
      });
    }

  } catch (error) {
    console.error('Barcode scan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

