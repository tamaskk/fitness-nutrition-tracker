# Meal Plan API Documentation

Complete guide for frontend integration with the Meal Plan API.

---

## 📋 Table of Contents
1. [Create Meal Plan](#1-create-meal-plan-with-ai)
2. [Get Meal Plans](#2-get-meal-plans)
3. [Update Meal Plan](#3-update-meal-plan)
4. [Delete Meal Plan](#4-delete-meal-plan)
5. [Update Single Meal](#5-update-single-meal-mark-as-completed)
6. [Data Models](#data-models)

---

## 1. Create Meal Plan (with AI)

### **Endpoint:**
```
POST /api/meal-plans
```

### **Frontend Request:**
```typescript
const response = await fetch('/api/meal-plans', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "My Weekly Meal Plan",
    description: "Healthy eating plan for next week", // optional
    type: "weekly", // 'daily' | 'weekly' | 'monthly' | 'custom'
    startDate: "2024-01-15", // ISO date string
    generateWithAI: true, // true = generate with AI, false = create empty plan
    preferences: {
      dislikes: ["gomba", "hagyma"], // Foods to avoid
      excludedIngredients: ["glutén", "laktóz"], // Ingredients to exclude
      allergies: ["mogyoró", "tenger gyümölcsei"], // Allergies
      dietaryRestrictions: ["vegetáriánus"], // 'vegetáriánus', 'vegán', 'gluténmentes', etc.
      calorieTarget: 2000, // Daily calorie goal (optional)
      proteinTarget: 150, // Daily protein goal in grams (optional)
    }
  })
});
```

### **API Response:**
```typescript
{
  success: true,
  message: "Meal plan created successfully",
  mealPlan: {
    _id: "507f1f77bcf86cd799439011",
    userId: "user123",
    name: "My Weekly Meal Plan",
    description: "Healthy eating plan for next week",
    type: "weekly",
    startDate: "2024-01-15T00:00:00.000Z",
    endDate: "2024-01-21T00:00:00.000Z",
    isActive: true,
    preferences: {
      dislikes: ["gomba", "hagyma"],
      excludedIngredients: ["glutén", "laktóz"],
      allergies: ["mogyoró", "tenger gyümölcsei"],
      dietaryRestrictions: ["vegetáriánus"],
      calorieTarget: 2000,
      proteinTarget: 150
    },
    days: [
      {
        dayNumber: 1,
        date: "2024-01-15T00:00:00.000Z",
        meals: [
          {
            recipeId: {
              _id: "507f1f77bcf86cd799439012",
              title: "Zabkása bogyós gyümölcsökkel",
              description: "Egészséges és tápláló reggeli",
              ingredients: [
                {
                  name: "zabpehely",
                  quantity: "50 g",
                  grams: 50
                },
                {
                  name: "áfonya",
                  quantity: "100 g",
                  grams: 100
                }
              ],
              steps: [
                "1. Forrald fel a tejet vagy vizet",
                "2. Add hozzá a zabpelyhet",
                "3. Főzd 5 percig"
              ],
              caloriesPerServing: 320,
              servings: 1,
              prepTime: 5,
              cookTime: 10,
              category: "reggeli",
              tags: ["egészséges", "gyors"],
              imageUrl: null,
              createdAt: "2024-01-10T10:00:00.000Z",
              updatedAt: "2024-01-10T10:00:00.000Z"
            },
            mealType: "breakfast",
            completed: false,
            completedAt: null,
            notes: ""
          },
          {
            recipeId: { /* Recipe object */ },
            mealType: "lunch",
            completed: false,
            completedAt: null,
            notes: ""
          },
          {
            recipeId: { /* Recipe object */ },
            mealType: "dinner",
            completed: false,
            completedAt: null,
            notes: ""
          },
          {
            recipeId: { /* Recipe object */ },
            mealType: "dessert",
            completed: false,
            completedAt: null,
            notes: ""
          }
        ]
      },
      // ... 6 more days for weekly plan
    ],
    createdAt: "2024-01-10T10:00:00.000Z",
    updatedAt: "2024-01-10T10:00:00.000Z"
  }
}
```

---

## 2. Get Meal Plans

### **Endpoint:**
```
GET /api/meal-plans
```

### **Get All Meal Plans:**
```typescript
// Get all meal plans
const response = await fetch('/api/meal-plans');

// Get only active meal plans
const response = await fetch('/api/meal-plans?active=true');

// Get with populated recipes
const response = await fetch('/api/meal-plans?populate=true');
```

### **Get Single Meal Plan:**
```typescript
const mealPlanId = "507f1f77bcf86cd799439011";
const response = await fetch(`/api/meal-plans?id=${mealPlanId}&populate=true`);
```

### **API Response (Multiple):**
```typescript
{
  success: true,
  mealPlans: [
    {
      _id: "507f1f77bcf86cd799439011",
      name: "My Weekly Meal Plan",
      type: "weekly",
      startDate: "2024-01-15T00:00:00.000Z",
      endDate: "2024-01-21T00:00:00.000Z",
      isActive: true,
      days: [ /* array of days */ ],
      // ... rest of meal plan data
    },
    // ... more meal plans
  ]
}
```

### **API Response (Single):**
```typescript
{
  success: true,
  mealPlan: {
    _id: "507f1f77bcf86cd799439011",
    // ... full meal plan data (same structure as create response)
  }
}
```

---

## 3. Update Meal Plan

### **Endpoint:**
```
PUT /api/meal-plans?id={mealPlanId}
```

### **Frontend Request:**
```typescript
const mealPlanId = "507f1f77bcf86cd799439011";

const response = await fetch(`/api/meal-plans?id=${mealPlanId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Updated Meal Plan Name", // optional
    description: "New description", // optional
    isActive: false, // optional - mark as inactive
    preferences: { // optional - update preferences
      dislikes: ["új ételek"],
      excludedIngredients: ["új hozzávalók"],
    },
    days: [ // optional - update entire days array
      {
        dayNumber: 1,
        date: "2024-01-15T00:00:00.000Z",
        meals: [
          {
            recipeId: "507f1f77bcf86cd799439012",
            mealType: "breakfast",
            completed: false,
            notes: ""
          }
        ]
      }
    ]
  })
});
```

### **API Response:**
```typescript
{
  success: true,
  message: "Meal plan updated successfully",
  mealPlan: {
    // ... updated meal plan data
  }
}
```

---

## 4. Delete Meal Plan

### **Endpoint:**
```
DELETE /api/meal-plans?id={mealPlanId}
```

### **Frontend Request:**
```typescript
const mealPlanId = "507f1f77bcf86cd799439011";

const response = await fetch(`/api/meal-plans?id=${mealPlanId}`, {
  method: 'DELETE',
});
```

### **API Response:**
```typescript
{
  success: true,
  message: "Meal plan deleted successfully"
}
```

---

## 5. Update Single Meal (Mark as Completed)

### **Endpoint:**
```
PATCH /api/meal-plans/{mealPlanId}/meals
```

### **Frontend Request - Mark Meal as Completed:**
```typescript
const mealPlanId = "507f1f77bcf86cd799439011";

const response = await fetch(`/api/meal-plans/${mealPlanId}/meals`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    dayNumber: 1,
    mealType: "breakfast",
    updates: {
      completed: true, // Mark as completed
      notes: "Nagyon finom volt!" // Optional notes
    }
  })
});
```

### **Frontend Request - Add Notes to Meal:**
```typescript
const response = await fetch(`/api/meal-plans/${mealPlanId}/meals`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    dayNumber: 2,
    mealType: "lunch",
    updates: {
      notes: "Több sót tettem bele"
    }
  })
});
```

### **Frontend Request - Replace Recipe:**
```typescript
const response = await fetch(`/api/meal-plans/${mealPlanId}/meals`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    dayNumber: 3,
    mealType: "dinner",
    updates: {
      recipeId: "507f1f77bcf86cd799439099" // New recipe ID
    }
  })
});
```

### **API Response:**
```typescript
{
  success: true,
  message: "Meal updated successfully",
  mealPlan: {
    // ... updated full meal plan with populated recipes
  }
}
```

---

## Data Models

### **MealPlan Type:**
```typescript
interface MealPlan {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string; // ISO date
  endDate?: string; // ISO date
  isActive: boolean;
  preferences: {
    dislikes: string[];
    excludedIngredients: string[];
    allergies?: string[];
    dietaryRestrictions?: string[];
    calorieTarget?: number;
    proteinTarget?: number;
  };
  days: Day[];
  createdAt: string;
  updatedAt: string;
}
```

### **Day Type:**
```typescript
interface Day {
  dayNumber: number; // 1, 2, 3, etc.
  date: string; // ISO date
  meals: Meal[];
}
```

### **Meal Type:**
```typescript
interface Meal {
  recipeId: string | Recipe; // Can be populated or just ID
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack';
  completed: boolean;
  completedAt?: string; // ISO date
  notes?: string;
}
```

### **Recipe Type** (from Recipe model):
```typescript
interface Recipe {
  _id: string;
  userId: string;
  externalId?: string;
  title: string;
  description?: string;
  ingredients: {
    name: string;
    quantity: string;
    grams: number;
  }[];
  steps: string[];
  caloriesPerServing: number;
  servings: number;
  prepTime: number;
  cookTime: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Usage Examples

### **Example 1: Create 7-day vegetarian meal plan**
```typescript
const createVegetarianPlan = async () => {
  const response = await fetch('/api/meal-plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Vegetáriánus Hét",
      type: "weekly",
      startDate: new Date().toISOString(),
      generateWithAI: true,
      preferences: {
        dietaryRestrictions: ["vegetáriánus"],
        excludedIngredients: ["hús", "hal", "baromfi"],
        calorieTarget: 1800,
        proteinTarget: 120
      }
    })
  });
  
  const data = await response.json();
  return data.mealPlan;
};
```

### **Example 2: Mark breakfast as completed**
```typescript
const markBreakfastCompleted = async (mealPlanId: string, dayNumber: number) => {
  const response = await fetch(`/api/meal-plans/${mealPlanId}/meals`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dayNumber,
      mealType: "breakfast",
      updates: {
        completed: true,
        notes: "Finom volt! 😊"
      }
    })
  });
  
  return response.json();
};
```

### **Example 3: Get today's meals from active plan**
```typescript
const getTodaysMeals = async () => {
  // Get active meal plan
  const response = await fetch('/api/meal-plans?active=true&populate=true');
  const { mealPlans } = await response.json();
  
  if (mealPlans.length === 0) return null;
  
  // Find today's day
  const today = new Date().toDateString();
  const activePlan = mealPlans[0];
  const todaysDay = activePlan.days.find(day => 
    new Date(day.date).toDateString() === today
  );
  
  return todaysDay?.meals || [];
};
```

### **Example 4: Track weekly progress**
```typescript
const getWeeklyProgress = async (mealPlanId: string) => {
  const response = await fetch(`/api/meal-plans?id=${mealPlanId}&populate=true`);
  const { mealPlan } = await response.json();
  
  const totalMeals = mealPlan.days.reduce((sum, day) => sum + day.meals.length, 0);
  const completedMeals = mealPlan.days.reduce((sum, day) => 
    sum + day.meals.filter(m => m.completed).length, 0
  );
  
  return {
    total: totalMeals,
    completed: completedMeals,
    percentage: (completedMeals / totalMeals) * 100
  };
};
```

---

## Error Responses

All endpoints may return these error responses:

### **401 Unauthorized:**
```typescript
{
  error: "Unauthorized"
}
```

### **400 Bad Request:**
```typescript
{
  error: "Name and start date are required"
}
```

### **404 Not Found:**
```typescript
{
  error: "Meal plan not found"
}
```

### **500 Internal Server Error:**
```typescript
{
  error: "Error message details"
}
```

### **504 Timeout (AI Generation):**
```typescript
{
  success: false,
  error: "Request timed out. Try reducing preferences complexity.",
  code: "TIMEOUT"
}
```

---

## Notes

- **Authentication Required:** All endpoints require valid NextAuth session
- **AI Generation Time:** Creating meal plans with AI may take 40-120 seconds depending on complexity
  - Plans are generated **one day at a time** for faster, more reliable responses
  - Each day sees the previous days' meals to ensure variety (no repetition)
  - Daily plan (1 day) = ~10-15 seconds
  - Weekly plan (7 days) = 7 requests (~70-105 seconds)
  - Monthly plan (30 days) = 30 requests (~5-8 minutes)
- **Recipe Persistence:** AI-generated recipes are saved to the database and can be reused
- **Smart Variety:** Each day's generation includes context from previous days to avoid repetitive meals
- **Meal Types:** Supported meal types are: `breakfast`, `lunch`, `dinner`, `dessert`, `snack`
- **Plan Types:** 
  - `daily` = 1 day
  - `weekly` = 7 days (recommended)
  - `monthly` = 30 days (takes longer to generate)
  - `custom` = specify your own duration
- **Populate Parameter:** Use `?populate=true` to get full recipe objects instead of just IDs
- **Timeout Handling:** If a timeout occurs on a specific day, you get partial results for days already generated

---

## Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Create plan | POST | `/api/meal-plans` |
| Get all plans | GET | `/api/meal-plans` |
| Get single plan | GET | `/api/meal-plans?id={id}` |
| Update plan | PUT | `/api/meal-plans?id={id}` |
| Delete plan | DELETE | `/api/meal-plans?id={id}` |
| Update meal | PATCH | `/api/meal-plans/{id}/meals` |

