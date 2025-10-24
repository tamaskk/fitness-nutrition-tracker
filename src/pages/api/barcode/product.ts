import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getUserFromToken } from '@/utils/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    // Connect to MongoDB first
    await connectDB();
    console.log('MongoDB connected');

    // Authentication (optional - remove if you want it public)
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

    // Get barcode from query parameters
    const { barcode } = req.query;

    if (!barcode || typeof barcode !== 'string') {
      return res.status(400).json({ 
        error: 'Barcode is required',
        message: 'Please provide a barcode as a query parameter: ?barcode=1234567890'
      });
    }

    console.log(`🔍 Fetching product data for barcode: ${barcode}`);

    // Call Open Food Facts API
    const openFoodFactsUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const response = await fetch(openFoodFactsUrl);

    if (!response.ok) {
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }

    const data = await response.json();

    // Check if product was found
    if (data.status === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        barcode,
        hint: 'This barcode is not in the Open Food Facts database'
      });
    }

    // Product found! Extract useful information
    const product = data.product;

    // Create a clean, structured response
    const productInfo = {
      success: true,
      barcode,
      product: {
        // Basic Info
        name: product.product_name || product.product_name_hu || product.product_name_en || 'Unknown',
        brand: product.brands || 'Unknown',
        quantity: product.quantity || 'N/A',
        categories: product.categories_tags || [],
        
        // Images
        image: product.image_url || product.image_front_url || null,
        imageSmall: product.image_small_url || null,
        imageFront: product.image_front_url || null,
        
        // Nutritional Information (per 100g/100ml)
        nutrition: {
          energyKcal: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.energy_100g / 4.184 || 0,
          energyKj: product.nutriments?.['energy-kj_100g'] || product.nutriments?.energy_100g || 0,
          fat: product.nutriments?.fat_100g || 0,
          saturatedFat: product.nutriments?.['saturated-fat_100g'] || 0,
          carbohydrates: product.nutriments?.carbohydrates_100g || 0,
          sugars: product.nutriments?.sugars_100g || 0,
          fiber: product.nutriments?.fiber_100g || 0,
          proteins: product.nutriments?.proteins_100g || 0,
          salt: product.nutriments?.salt_100g || 0,
          sodium: product.nutriments?.sodium_100g || 0,
        },
        
        // Nutri-Score (A-E rating)
        nutriScore: product.nutriscore_grade?.toUpperCase() || null,
        nutriScoreScore: product.nutriscore_score || null,
        
        // Ingredients
        ingredients: product.ingredients_text || product.ingredients_text_hu || 'N/A',
        ingredientsList: product.ingredients || [],
        
        // Allergens
        allergens: product.allergens_tags || [],
        allergensText: product.allergens || 'N/A',
        
        // Traces
        traces: product.traces_tags || [],
        tracesText: product.traces || 'N/A',
        
        // Labels (bio, vegan, etc.)
        labels: product.labels_tags || [],
        labelsText: product.labels || 'N/A',
        
        // Serving size
        servingSize: product.serving_size || 'N/A',
        servingQuantity: product.serving_quantity || null,
        
        // Additional Info
        countries: product.countries_tags || [],
        stores: product.stores || 'N/A',
        packaging: product.packaging || 'N/A',
        origin: product.origins || 'N/A',
        
        // Nova Group (food processing level: 1-4)
        novaGroup: product.nova_group || null,
        
        // Eco Score (environmental impact: A-E)
        ecoScore: product.ecoscore_grade?.toUpperCase() || null,
        ecoScoreScore: product.ecoscore_score || null,
      },
      
      // Raw data (if you need anything else)
      raw: product,
      
      // Source info
      source: {
        api: 'Open Food Facts',
        url: `https://world.openfoodfacts.org/product/${barcode}`,
        lastModified: product.last_modified_t ? new Date(product.last_modified_t * 1000).toISOString() : null
      }
    };

    console.log(`✅ Product found: ${productInfo.product.name}`);

    return res.status(200).json(productInfo);

  } catch (error) {
    console.error('Barcode product lookup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false,
      error: errorMessage 
    });
  }
}

