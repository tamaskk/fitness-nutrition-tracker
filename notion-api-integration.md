# Notion API Integration Guide

## 🔗 Integration Options

### Option 1: Recipe Management in Notion
Sync your recipe database with Notion for content management.

### Option 2: User Data Export
Allow users to export their fitness data to personal Notion workspaces.

### Option 3: Development Workflow
Integrate development tasks and documentation with Notion.

---

## 🛠️ Setup Instructions

### 1. Install Notion SDK
```bash
npm install @notionhq/client
```

### 2. Environment Variables
Add to your `.env.local`:
```env
NOTION_API_KEY=secret_your_notion_integration_token
NOTION_DATABASE_ID=your_database_id_here
```

### 3. Create Notion Integration
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it "Fitness Tracker Integration"
4. Select your workspace
5. Copy the Internal Integration Token

---

## 📊 Database Schemas for Notion

### Recipe Database Schema
```typescript
const recipeProperties = {
  "Name": { title: {} },
  "Calories": { number: { format: "number" } },
  "Prep Time": { number: { format: "number" } },
  "Cook Time": { number: { format: "number" } },
  "Servings": { number: { format: "number" } },
  "Category": { 
    select: { 
      options: [
        { name: "Breakfast", color: "yellow" },
        { name: "Lunch", color: "green" },
        { name: "Dinner", color: "blue" },
        { name: "Snack", color: "purple" },
        { name: "Dessert", color: "pink" }
      ]
    }
  },
  "Cuisine": {
    select: {
      options: [
        { name: "American", color: "red" },
        { name: "Italian", color: "green" },
        { name: "Asian", color: "orange" },
        { name: "Mexican", color: "yellow" },
        { name: "Mediterranean", color: "blue" }
      ]
    }
  },
  "Dietary": {
    multi_select: {
      options: [
        { name: "Vegetarian", color: "green" },
        { name: "Vegan", color: "green" },
        { name: "Gluten-Free", color: "yellow" },
        { name: "Keto", color: "red" },
        { name: "Low-Carb", color: "orange" }
      ]
    }
  },
  "Ingredients": { rich_text: {} },
  "Instructions": { rich_text: {} },
  "Image URL": { url: {} },
  "Created": { created_time: {} },
  "Last Modified": { last_edited_time: {} }
};
```

### User Progress Database Schema
```typescript
const progressProperties = {
  "Date": { date: {} },
  "User": { title: {} },
  "Calories Consumed": { number: { format: "number" } },
  "Calories Burned": { number: { format: "number" } },
  "Net Calories": { formula: { expression: "prop(\"Calories Consumed\") - prop(\"Calories Burned\")" } },
  "Weight": { number: { format: "number_with_commas" } },
  "Meals": { number: { format: "number" } },
  "Workouts": { number: { format: "number" } },
  "Notes": { rich_text: {} }
};
```

---

## 💻 Implementation Code

### Notion Client Setup
```typescript
// lib/notion.ts
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export default notion;
```

### Recipe Sync Functions
```typescript
// utils/notionSync.ts
import notion from '../lib/notion';
import { Recipe } from '../models/Recipe';

export const syncRecipeToNotion = async (recipe: Recipe) => {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_RECIPE_DATABASE_ID!,
      },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: recipe.title,
              },
            },
          ],
        },
        "Calories": {
          number: recipe.calories || 0,
        },
        "Prep Time": {
          number: recipe.prepTime || 0,
        },
        "Cook Time": {
          number: recipe.cookTime || 0,
        },
        "Servings": {
          number: recipe.servings || 1,
        },
        "Category": {
          select: {
            name: recipe.category || "Other",
          },
        },
        "Ingredients": {
          rich_text: [
            {
              text: {
                content: recipe.ingredients.join('\n'),
              },
            },
          ],
        },
        "Instructions": {
          rich_text: [
            {
              text: {
                content: recipe.instructions.join('\n'),
              },
            },
          ],
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error syncing recipe to Notion:', error);
    throw error;
  }
};

export const getRecipesFromNotion = async () => {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_RECIPE_DATABASE_ID!,
    });

    return response.results.map((page: any) => ({
      id: page.id,
      title: page.properties.Name.title[0]?.text.content || '',
      calories: page.properties.Calories.number || 0,
      prepTime: page.properties['Prep Time'].number || 0,
      cookTime: page.properties['Cook Time'].number || 0,
      servings: page.properties.Servings.number || 1,
      category: page.properties.Category.select?.name || '',
      ingredients: page.properties.Ingredients.rich_text[0]?.text.content.split('\n') || [],
      instructions: page.properties.Instructions.rich_text[0]?.text.content.split('\n') || [],
    }));
  } catch (error) {
    console.error('Error fetching recipes from Notion:', error);
    throw error;
  }
};
```

### User Data Export
```typescript
// utils/notionExport.ts
export const exportUserDataToNotion = async (userId: string, databaseId: string) => {
  try {
    // Get user's meal entries
    const meals = await MealEntry.find({ userId }).sort({ date: -1 });
    
    // Get user's workout entries
    const workouts = await WorkoutEntry.find({ userId }).sort({ date: -1 });

    // Group by date and create daily summaries
    const dailySummaries = groupDataByDate(meals, workouts);

    // Create pages in Notion for each day
    for (const summary of dailySummaries) {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          "Date": {
            date: { start: summary.date },
          },
          "User": {
            title: [{ text: { content: summary.userName } }],
          },
          "Calories Consumed": {
            number: summary.caloriesConsumed,
          },
          "Calories Burned": {
            number: summary.caloriesBurned,
          },
          "Meals": {
            number: summary.mealCount,
          },
          "Workouts": {
            number: summary.workoutCount,
          },
          "Notes": {
            rich_text: [
              {
                text: {
                  content: `Meals: ${summary.meals.join(', ')}\nWorkouts: ${summary.workouts.join(', ')}`,
                },
              },
            ],
          },
        },
      });
    }

    return { success: true, exported: dailySummaries.length };
  } catch (error) {
    console.error('Error exporting to Notion:', error);
    throw error;
  }
};
```

---

## 🔄 API Routes

### Export to Notion Endpoint
```typescript
// pages/api/notion/export.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { exportUserDataToNotion } from '../../../utils/notionExport';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { databaseId } = req.body;
    if (!databaseId) {
      return res.status(400).json({ message: 'Database ID required' });
    }

    const result = await exportUserDataToNotion(session.user.id, databaseId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Export failed' });
  }
}
```

### Recipe Sync Endpoint
```typescript
// pages/api/notion/recipes/sync.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { syncRecipeToNotion, getRecipesFromNotion } from '../../../../utils/notionSync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Sync recipe to Notion
      const { recipe } = req.body;
      const result = await syncRecipeToNotion(recipe);
      return res.status(200).json(result);
    }

    if (req.method === 'GET') {
      // Get recipes from Notion
      const recipes = await getRecipesFromNotion();
      return res.status(200).json(recipes);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ message: 'Sync failed' });
  }
}
```

---

## 🎨 Frontend Integration

### Export Button Component
```tsx
// components/NotionExportButton.tsx
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface NotionExportButtonProps {
  userId: string;
}

export const NotionExportButton: React.FC<NotionExportButtonProps> = ({ userId }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [databaseId, setDatabaseId] = useState('');

  const handleExport = async () => {
    if (!databaseId.trim()) {
      toast.error('Please enter your Notion database ID');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/notion/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseId }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(`Successfully exported ${result.exported} days of data!`);
      } else {
        toast.error(result.message || 'Export failed');
      }
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notion Database ID
        </label>
        <input
          type="text"
          value={databaseId}
          onChange={(e) => setDatabaseId(e.target.value)}
          placeholder="Enter your Notion database ID"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Create a database in Notion and copy its ID from the URL
        </p>
      </div>
      
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? 'Exporting...' : 'Export to Notion'}
      </button>
    </div>
  );
};
```

---

## 📋 Usage Instructions

### For Users
1. **Create Notion Database**: Copy the database template from the setup guide
2. **Get Database ID**: Copy the database ID from the Notion URL
3. **Export Data**: Use the export button in your profile settings
4. **View in Notion**: Access your exported data in your Notion workspace

### For Developers
1. **Set up Integration**: Create Notion integration and get API key
2. **Configure Environment**: Add API keys to environment variables
3. **Test Endpoints**: Use the API routes to sync data
4. **Monitor Usage**: Track API usage and rate limits

---

## 🔒 Security Considerations

### API Key Management
- Store API keys securely in environment variables
- Use different keys for development and production
- Rotate keys regularly

### Data Privacy
- Only export user's own data
- Implement proper authentication checks
- Allow users to control what data is exported

### Rate Limiting
- Implement rate limiting for Notion API calls
- Handle API rate limit responses gracefully
- Queue large exports to avoid hitting limits

---

## 🚀 Deployment Notes

### Environment Setup
```bash
# Production environment variables
NOTION_API_KEY=secret_prod_key_here
NOTION_RECIPE_DATABASE_ID=prod_database_id
NOTION_PROGRESS_DATABASE_ID=prod_progress_db_id
```

### Monitoring
- Set up logging for Notion API calls
- Monitor API usage and costs
- Track export success/failure rates

### Backup Strategy
- Regular backups of Notion data
- Sync verification processes
- Data integrity checks
