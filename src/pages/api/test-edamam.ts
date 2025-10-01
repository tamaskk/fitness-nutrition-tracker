import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_API_KEY;
  const foodAppId = process.env.EDAMAM_FOOD_APP_ID;
  const foodAppKey = process.env.EDAMAM_FOOD_APP_KEY;

  console.log('Testing Edamam API credentials...');
  
  const testResults: any = {
    credentials: {
      hasRecipeAppId: !!appId,
      hasRecipeAppKey: !!appKey,
      hasFoodAppId: !!foodAppId,
      hasFoodAppKey: !!foodAppKey,
      recipeAppIdLength: appId?.length,
      recipeAppKeyLength: appKey?.length,
      foodAppIdLength: foodAppId?.length,
      foodAppKeyLength: foodAppKey?.length,
    },
    tests: []
  };

  // Test 1: Recipe Search API v2
  if (appId && appKey) {
    try {
      const recipeUrl = `https://api.edamam.com/api/recipes/v2?type=public&q=chicken&app_id=${appId}&app_key=${appKey}&from=0&to=5`;
      console.log('Testing Recipe API v2:', recipeUrl);
      
      const response = await fetch(recipeUrl);
      testResults.tests.push({
        api: 'Recipe Search API v2',
        status: response.status,
        success: response.ok,
        url: recipeUrl.replace(appKey, appKey.substring(0, 4) + '***')
      });
      
      if (response.ok) {
        const data = await response.json();
        testResults.tests[testResults.tests.length - 1].resultCount = data.hits?.length || 0;
      }
    } catch (error) {
      testResults.tests.push({
        api: 'Recipe Search API v2',
        error: error.message
      });
    }
  }

  // Test 2: Recipe Search API v1 (older version)
  if (appId && appKey) {
    try {
      const recipeUrlV1 = `https://api.edamam.com/search?q=chicken&app_id=${appId}&app_key=${appKey}&from=0&to=5`;
      console.log('Testing Recipe API v1:', recipeUrlV1);
      
      const response = await fetch(recipeUrlV1);
      testResults.tests.push({
        api: 'Recipe Search API v1',
        status: response.status,
        success: response.ok,
        url: recipeUrlV1.replace(appKey, appKey.substring(0, 4) + '***')
      });
      
      if (response.ok) {
        const data = await response.json();
        testResults.tests[testResults.tests.length - 1].resultCount = data.hits?.length || 0;
      }
    } catch (error) {
      testResults.tests.push({
        api: 'Recipe Search API v1',
        error: error.message
      });
    }
  }

  // Test 3: Food Database API
  if (foodAppId && foodAppKey) {
    try {
      const foodUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${foodAppId}&app_key=${foodAppKey}&ingr=chicken&nutrition-type=cooking`;
      console.log('Testing Food Database API:', foodUrl);
      
      const response = await fetch(foodUrl);
      testResults.tests.push({
        api: 'Food Database API',
        status: response.status,
        success: response.ok,
        url: foodUrl.replace(foodAppKey, foodAppKey.substring(0, 4) + '***')
      });
      
      if (response.ok) {
        const data = await response.json();
        testResults.tests[testResults.tests.length - 1].resultCount = (data.parsed?.length || 0) + (data.hints?.length || 0);
      }
    } catch (error) {
      testResults.tests.push({
        api: 'Food Database API',
        error: error.message
      });
    }
  }

  console.log('Test results:', JSON.stringify(testResults, null, 2));
  res.status(200).json(testResults);
}

