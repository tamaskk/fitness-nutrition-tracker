# Recipe Steps - Backwards Compatibility Fix

## Problem
After updating the recipe steps structure to include `step` and `ingredient` fields, existing code that sends recipes in the old format (plain string array) started failing with validation errors:

```
Recipe validation failed: steps.0.ingredient: Path `ingredient` is required.
```

## Solution ✅

Implemented **backwards compatibility** to support BOTH old and new step formats:

### 1. Made `ingredient` Field Optional

**File: `src/models/Recipe.ts`**
```typescript
steps: [{
  step: {
    type: String,
    required: true,
    trim: true,
  },
  ingredient: {
    type: String,
    required: false, // ✅ Optional for backwards compatibility
    trim: true,
    default: '',
  },
}]
```

### 2. Added Step Normalization Function

**File: `src/pages/api/recipes.ts`**

Added a helper function that automatically converts old format to new format:

```typescript
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
```

This function is now used in BOTH POST and PUT endpoints.

### 3. Updated TypeScript Interface

**File: `src/types/index.ts`**
```typescript
steps?: { step: string; ingredient?: string }[]; // ingredient is optional
```

---

## Supported Formats

### ✅ Old Format (Still Works)
```json
{
  "title": "Pasta",
  "ingredients": [...],
  "steps": [
    "1. Boil water",
    "2. Cook pasta",
    "3. Add sauce"
  ]
}
```

**Automatically converted to:**
```json
{
  "steps": [
    { "step": "1. Boil water", "ingredient": "" },
    { "step": "2. Cook pasta", "ingredient": "" },
    { "step": "3. Add sauce", "ingredient": "" }
  ]
}
```

### ✅ New Format (Preferred)
```json
{
  "title": "Pasta",
  "ingredients": [...],
  "steps": [
    {
      "step": "Boil water in a large pot",
      "ingredient": "2 liters water, 1 tsp salt"
    },
    {
      "step": "Cook pasta until al dente",
      "ingredient": "200g pasta"
    },
    {
      "step": "Add your favorite sauce",
      "ingredient": "150ml tomato sauce"
    }
  ]
}
```

### ✅ Mixed Format (Also Works)
```json
{
  "steps": [
    {
      "step": "Boil water in a large pot",
      "ingredient": "2 liters water, 1 tsp salt"
    },
    {
      "step": "Cook pasta until al dente"
      // No ingredient field - defaults to empty string
    },
    "Add your favorite sauce"
    // Old format string - automatically converted
  ]
}
```

---

## How It Works

### POST /api/recipes
```
Incoming Request → normalizeSteps() → Save to MongoDB
```

**Example:**
```javascript
// Request
{
  "steps": ["Boil water", "Cook pasta"]
}

// After normalization
{
  "steps": [
    { "step": "Boil water", "ingredient": "" },
    { "step": "Cook pasta", "ingredient": "" }
  ]
}

// Saved to MongoDB
✅ Success
```

### PUT /api/recipes/[id]
Same normalization applied when updating recipes.

### AI-Generated Recipes
AI-generated recipes from `/api/recipes/generate` and `/api/meal-plans` will use the **new format** with both `step` and `ingredient` fields populated.

---

## Testing

### Test Old Format
```bash
curl -X POST https://your-api.com/api/recipes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Recipe",
    "ingredients": [{"name": "chicken", "quantity": "200g"}],
    "steps": [
      "Cook the chicken",
      "Season with salt"
    ],
    "servings": 2
  }'
```

**Expected:** ✅ Success - Steps automatically converted to new format

### Test New Format
```bash
curl -X POST https://your-api.com/api/recipes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Recipe",
    "ingredients": [{"name": "chicken", "quantity": "200g"}],
    "steps": [
      {
        "step": "Cook the chicken in a pan",
        "ingredient": "200g chicken, 1 tsp oil"
      },
      {
        "step": "Season with salt and pepper",
        "ingredient": "salt, pepper"
      }
    ],
    "servings": 2
  }'
```

**Expected:** ✅ Success - Steps saved as-is

### Test Mixed Format
```bash
curl -X POST https://your-api.com/api/recipes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Recipe",
    "ingredients": [{"name": "chicken", "quantity": "200g"}],
    "steps": [
      {
        "step": "Cook the chicken in a pan",
        "ingredient": "200g chicken, 1 tsp oil"
      },
      "Season with salt and pepper"
    ],
    "servings": 2
  }'
```

**Expected:** ✅ Success - Mixed formats handled correctly

---

## Benefits

1. ✅ **No Breaking Changes** - Old client code continues to work
2. ✅ **Automatic Migration** - Old format automatically converted to new format
3. ✅ **Flexible** - Supports any combination of old and new formats
4. ✅ **Future-Ready** - AI-generated recipes use enhanced format
5. ✅ **No Data Loss** - All existing recipes remain valid

---

## Migration Path

### Phase 1: Backwards Compatibility (Current) ✅
- Both formats accepted
- Old format automatically converted
- No client changes required

### Phase 2: Encourage New Format (Future)
- Update Flutter app to send new format
- Update documentation to show new format
- Old format still works

### Phase 3: Optional Cleanup (Future)
- Run migration script to convert all old-format recipes
- Consider deprecating old format support
- Not necessary unless storage optimization needed

---

## Files Modified

1. **`src/models/Recipe.ts`**
   - Made `ingredient` field optional
   - Added default empty string

2. **`src/pages/api/recipes.ts`**
   - Added `normalizeSteps()` helper function
   - Applied to POST endpoint
   - Applied to PUT endpoint

3. **`src/types/index.ts`**
   - Made `ingredient` field optional in TypeScript interface

---

## Summary

✅ **Problem Solved**: Old recipe format no longer causes validation errors

✅ **Backwards Compatible**: All existing code continues to work

✅ **Future Enhanced**: New AI-generated recipes have detailed step-ingredient mapping

✅ **Zero Downtime**: No breaking changes, no migration required

---

**Last Updated**: 2024-10-28  
**Status**: ✅ Complete and Tested  
**Breaking Change**: No - Fully backwards compatible

