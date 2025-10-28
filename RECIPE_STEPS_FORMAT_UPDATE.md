# Recipe Steps Format Update

## Overview
Updated the recipe steps structure from a simple string array to a more detailed object array that includes both the instruction and the ingredients needed for each step.

---

## 🔄 What Changed

### Before (Old Format)
```json
{
  "title": "Chicken Pasta",
  "ingredients": [
    {"name": "chicken", "amount": "300", "unit": "g"},
    {"name": "pasta", "amount": "200", "unit": "g"}
  ],
  "instructions": [
    "1. lépés: Főzd meg a tésztát",
    "2. lépés: Grillezd meg a csirkemellet",
    "3. lépés: Keverd össze"
  ]
}
```

### After (New Format) ✅
```json
{
  "title": "Chicken Pasta",
  "ingredients": [
    {"name": "chicken", "amount": "300", "unit": "g"},
    {"name": "pasta", "amount": "200", "unit": "g"}
  ],
  "instructions": [
    {
      "step": "Főzd meg a tésztát sós vízben al dente állagúra",
      "ingredient": "200g tészta, 1 teáskanál só"
    },
    {
      "step": "Grillezd meg a csirkemellet mindkét oldalán 5-6 percig",
      "ingredient": "300g csirkemell, 1 teáskanál olaj"
    },
    {
      "step": "Keverd össze a tésztát a felszeletelt csirkemellel",
      "ingredient": "megfőtt tészta, sült csirkemell"
    }
  ]
}
```

---

## 💡 Benefits

### Old Format Issues:
- ❌ No clear connection between steps and ingredients
- ❌ Hard to know what ingredients are needed for each step
- ❌ Users had to constantly scroll between ingredients list and steps
- ❌ Not ideal for step-by-step cooking

### New Format Benefits:
- ✅ **Clear ingredient-step relationship**
- ✅ **Better cooking experience** - know what you need for each step
- ✅ **More organized** - ingredients grouped by when they're used
- ✅ **Easier to follow** - no need to scroll back and forth
- ✅ **AI can be more precise** about ingredient usage

---

## 📊 Data Structure

### TypeScript Interface
```typescript
export interface Recipe {
  _id?: string;
  userId: string;
  title: string;
  ingredients: { name: string; quantity?: string; grams?: number }[];
  steps?: { step: string; ingredient: string }[]; // ✅ NEW FORMAT
  caloriesPerServing?: number;
  // ... other fields
}
```

### MongoDB Schema
```typescript
const RecipeSchema = new Schema({
  // ... other fields ...
  steps: [{
    step: {
      type: String,
      required: true,
      trim: true,
    },
    ingredient: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  // ... other fields ...
});
```

---

## 🤖 AI Generation Updates

### Recipe Generation (`/api/recipes/generate.ts`)

**Updated Prompt:**
```typescript
"instructions": [
  {
    "step": "Részletes utasítás mit kell csinálni ebben a lépésben",
    "ingredient": "Az ehhez a lépéshez szükséges hozzávalók listája (pl. '300g csirkemell, 1 teáskanál só')"
  },
  {
    "step": "Következő lépés részletes utasítása",
    "ingredient": "Az ehhez a lépéshez szükséges hozzávalók"
  }
]
```

**System Message Update:**
- Added: "FONTOS: Az 'instructions' tömb elemei objektumok legyenek 'step' és 'ingredient' mezőkkel!"

### Meal Plan Generation (`/api/meal-plans/index.ts`)

**Updated Prompt:**
```typescript
"instructions": [
  {
    "step": "Mit kell csinálni ebben a lépésben",
    "ingredient": "Az ehhez szükséges hozzávalók (pl. '100g liszt, 2 tojás')"
  }
]
```

**System Message Update:**
- Added: "FONTOS: Az 'instructions' tömb elemei objektumok legyenek 'step' (utasítás) és 'ingredient' (hozzávalók) mezőkkel!"

---

## 📝 Example Recipes

### Example 1: Simple Pasta
```json
{
  "title": "Carbonara",
  "ingredients": [
    {"name": "spagetti", "amount": "400", "unit": "g"},
    {"name": "bacon", "amount": "150", "unit": "g"},
    {"name": "tojás", "amount": "3", "unit": "db"},
    {"name": "sajt", "amount": "100", "unit": "g"}
  ],
  "instructions": [
    {
      "step": "Forrald fel a vizet, add hozzá a sót, és főzd meg a spagettit al dente állagúra (kb. 10 perc)",
      "ingredient": "400g spagetti, 1 teáskanál só, 2 liter víz"
    },
    {
      "step": "Közben vágjad apró kockákra a bacont és pirítsd ki egy serpenyőben ropogósra",
      "ingredient": "150g bacon"
    },
    {
      "step": "Egy tálban verd fel a tojásokat a reszelt sajttal",
      "ingredient": "3 tojás, 100g reszelt sajt"
    },
    {
      "step": "Szűrd le a tésztát, keverd bele a ropogós baconhoz, majd öntsd rá a tojás-sajt keveréket. Gyorsan keverd össze",
      "ingredient": "megfőtt tészta, pirított bacon, tojás-sajt keverék"
    }
  ]
}
```

### Example 2: Stir-Fry
```json
{
  "title": "Ázsiai Csirke Wok",
  "ingredients": [
    {"name": "csirkemell", "amount": "400", "unit": "g"},
    {"name": "brokkoli", "amount": "200", "unit": "g"},
    {"name": "paprika", "amount": "2", "unit": "db"},
    {"name": "szójaszósz", "amount": "3", "unit": "evőkanál"}
  ],
  "instructions": [
    {
      "step": "Vágd a csirkemellet kis kockákra",
      "ingredient": "400g csirkemell"
    },
    {
      "step": "A brokkolit és a paprikát vágd kisebb darabokra",
      "ingredient": "200g brokkoli, 2 paprika"
    },
    {
      "step": "Hevíts fel egy wokban olajat, és pirítsd meg a csirkét 5-6 percig",
      "ingredient": "csirkekockák, 2 evőkanál olaj"
    },
    {
      "step": "Add hozzá a zöldségeket és pirítsd további 3-4 percig",
      "ingredient": "brokkoli, paprika"
    },
    {
      "step": "Öntsd rá a szójaszószt, keverd át és főzd még 2 percig",
      "ingredient": "3 evőkanál szójaszósz"
    }
  ]
}
```

---

## 🔧 API Request Examples

### POST /api/recipes - Create Recipe
```bash
curl -X POST https://your-api.com/api/recipes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Recipe",
    "ingredients": [
      {"name": "chicken", "quantity": "300g"}
    ],
    "steps": [
      {
        "step": "Cook the chicken until golden",
        "ingredient": "300g chicken, 1 tsp oil"
      },
      {
        "step": "Season with salt and pepper",
        "ingredient": "salt, pepper"
      }
    ],
    "servings": 2,
    "caloriesPerServing": 350
  }'
```

### Response
```json
{
  "_id": "...",
  "userId": "...",
  "title": "Test Recipe",
  "ingredients": [...],
  "steps": [
    {
      "step": "Cook the chicken until golden",
      "ingredient": "300g chicken, 1 tsp oil"
    },
    {
      "step": "Season with salt and pepper",
      "ingredient": "salt, pepper"
    }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## 🎯 Frontend Integration

### Display Steps
```dart
// Flutter example
ListView.builder(
  itemCount: recipe.steps?.length ?? 0,
  itemBuilder: (context, index) {
    final step = recipe.steps![index];
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Lépés ${index + 1}',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            SizedBox(height: 8),
            Text(
              step.step,
              style: TextStyle(fontSize: 14),
            ),
            SizedBox(height: 8),
            Container(
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.restaurant, size: 16),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      step.ingredient,
                      style: TextStyle(
                        fontSize: 12,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  },
)
```

### React Example
```tsx
{recipe.steps?.map((step, index) => (
  <div key={index} className="step-card">
    <h4>Step {index + 1}</h4>
    <p className="instruction">{step.step}</p>
    <div className="ingredients-needed">
      <span className="icon">🥘</span>
      <span className="text">{step.ingredient}</span>
    </div>
  </div>
))}
```

---

## 🔄 Migration Notes

### Backwards Compatibility
The change is **NOT backwards compatible** with old recipes that have string arrays for steps.

### Migration Strategy Options

#### Option 1: Keep Old Recipes As-Is (Recommended for MVP)
- Old recipes with string array steps will fail validation
- Accept that old recipes need to be regenerated or manually updated
- Focus on new recipe generation going forward

#### Option 2: Create Migration Script (If you have many existing recipes)
```typescript
// Migration script example
import Recipe from '@/models/Recipe';

async function migrateRecipes() {
  const oldRecipes = await Recipe.find({
    'steps.0': { $type: 'string' } // Find recipes with old format
  });

  for (const recipe of oldRecipes) {
    // Convert old format to new format
    const newSteps = (recipe.steps as any[]).map((step: string) => ({
      step: step,
      ingredient: "Lásd a teljes hozzávalólistát" // Default value
    }));

    recipe.steps = newSteps;
    await recipe.save();
  }

  console.log(`Migrated ${oldRecipes.length} recipes`);
}
```

#### Option 3: Support Both Formats Temporarily
- Add validation logic to accept both formats
- Gradually migrate to new format
- Not recommended - adds complexity

---

## 🧪 Testing

### Test AI Generation
1. **Generate Recipe** via `/api/recipes/generate`
   ```bash
   POST /api/recipes/generate
   {
     "ingredients": ["chicken", "pasta", "tomato"]
   }
   ```

2. **Verify Steps Format**
   - Check that `instructions` is an array of objects
   - Each object has `step` and `ingredient` fields
   - Both fields are non-empty strings

3. **Generate Meal Plan** via `/api/meal-plans`
   ```bash
   POST /api/meal-plans
   {
     "type": "weekly",
     "startDate": "2024-01-15"
   }
   ```

4. **Verify Meal Plan Recipes**
   - Check that all generated recipes have new step format
   - Verify steps make sense and ingredients match

### Test Manual Creation
1. **Create Recipe Manually**
   ```bash
   POST /api/recipes
   {
     "title": "Test",
     "ingredients": [...],
     "steps": [
       {
         "step": "Do something",
         "ingredient": "ingredient1, ingredient2"
       }
     ]
   }
   ```

2. **Verify Saved Correctly**
   - GET the recipe back
   - Confirm steps structure is preserved

---

## 📁 Files Modified

### Backend Files
1. **`src/models/Recipe.ts`**
   - Updated `steps` schema from string array to object array
   - Added `step` and `ingredient` fields (both required)

2. **`src/types/index.ts`**
   - Updated Recipe TypeScript interface
   - Changed `steps?: string[]` to `steps?: { step: string; ingredient: string }[]`

3. **`src/pages/api/recipes/generate.ts`**
   - Updated AI prompt to generate new step format
   - Updated system message to enforce new format
   - Example structure updated

4. **`src/pages/api/meal-plans/index.ts`**
   - Updated AI prompt for meal plan generation
   - Updated system message to enforce new format
   - Example structure updated

### No Changes Needed
- `src/pages/api/recipes.ts` - Already handles any step format from request body
- Other API endpoints - Don't directly manipulate steps

---

## ✅ Checklist

- [x] Update Recipe model schema
- [x] Update TypeScript type definition
- [x] Update recipe generation AI prompt
- [x] Update recipe generation system message
- [x] Update meal plan generation AI prompt
- [x] Update meal plan generation system message
- [x] Test AI recipe generation
- [ ] Test AI meal plan generation
- [ ] Update frontend to display new format
- [ ] Test end-to-end flow

---

## 🎉 Benefits Summary

1. **Better UX**: Users can see exactly what ingredients they need for each step
2. **Step-by-step Cooking**: Perfect for following along while cooking
3. **Reduced Confusion**: No more "which ingredient was that again?"
4. **AI Precision**: AI can be more specific about ingredient usage per step
5. **Future Features**: Enables shopping list generation per cooking step

---

**Last Updated**: 2024-10-28  
**Status**: ✅ Backend Complete - Frontend Update Needed  
**Breaking Change**: Yes - Old recipe format not compatible

