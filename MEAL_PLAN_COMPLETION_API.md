# Meal Plan Completion API Documentation

How to mark meals as completed/uncompleted and automatically log them as MealEntry.

---

## 🎯 Overview

When a user completes a meal from their meal plan:
- ✅ **Completed = true**: Creates a `MealEntry` in the database (logs the meal)
- ❌ **Completed = false**: Deletes the `MealEntry` from the database (removes the log)

---

## 📡 API Endpoint

### **PATCH** `/api/meal-plans/{mealPlanId}/meals`

Update a specific meal's completion status in a meal plan.

---

## 📤 Request

### **Method:** PATCH

### **URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mealPlanId` | string | ✅ Yes | The meal plan's MongoDB ID |

### **Request Body:**

```typescript
{
  "dayNumber": number,        // Which day (1, 2, 3, etc.)
  "mealType": string,         // "breakfast", "lunch", "dinner", or "dessert"
  "updates": {
    "completed": boolean      // true = complete, false = uncomplete
  }
}
```

---

## 🚀 Usage Examples

### **Example 1: Mark Breakfast as Completed**

```typescript
// COMPLETE a meal
const completeMeal = async (mealPlanId: string, dayNumber: number, mealType: string) => {
  const response = await fetch(`/api/meal-plans/${mealPlanId}/meals`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dayNumber: dayNumber,     // e.g., 1
      mealType: mealType,       // e.g., "breakfast"
      updates: {
        completed: true         // ✅ Mark as completed
      }
    })
  });

  const data = await response.json();
  return data;
};

// Usage
await completeMeal('507f1f77bcf86cd799439011', 1, 'breakfast');
```

**What happens:**
1. ✅ Meal is marked as completed in the meal plan
2. ✅ `completedAt` timestamp is set
3. ✅ A new `MealEntry` is created in the database
4. ✅ User's daily food log is updated

---

### **Example 2: Mark Lunch as NOT Completed (Undo)**

```typescript
// UNCOMPLETE a meal (remove from log)
const uncompleteMeal = async (mealPlanId: string, dayNumber: number, mealType: string) => {
  const response = await fetch(`/api/meal-plans/${mealPlanId}/meals`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dayNumber: dayNumber,     // e.g., 2
      mealType: mealType,       // e.g., "lunch"
      updates: {
        completed: false        // ❌ Mark as NOT completed
      }
    })
  });

  const data = await response.json();
  return data;
};

// Usage
await uncompleteMeal('507f1f77bcf86cd799439011', 2, 'lunch');
```

**What happens:**
1. ❌ Meal is marked as NOT completed in the meal plan
2. ❌ `completedAt` timestamp is removed
3. ❌ The corresponding `MealEntry` is DELETED from the database
4. ❌ User's daily food log is updated (meal removed)

---

### **Example 3: Complete Multiple Meals**

```typescript
const completeDailyMeals = async (mealPlanId: string, dayNumber: number) => {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert'];
  
  for (const mealType of mealTypes) {
    await fetch(`/api/meal-plans/${mealPlanId}/meals`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dayNumber,
        mealType,
        updates: { completed: true }
      })
    });
  }
  
  console.log(`All meals for day ${dayNumber} completed!`);
};

// Complete all meals for day 1
await completeDailyMeals('507f1f77bcf86cd799439011', 1);
```

---

### **Example 4: Toggle Meal Completion**

```typescript
const toggleMealCompletion = async (
  mealPlanId: string, 
  dayNumber: number, 
  mealType: string,
  isCurrentlyCompleted: boolean
) => {
  const response = await fetch(`/api/meal-plans/${mealPlanId}/meals`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dayNumber,
      mealType,
      updates: {
        completed: !isCurrentlyCompleted  // Toggle the state
      }
    })
  });

  return response.json();
};

// Usage in a button click handler
<button onClick={() => toggleMealCompletion(
  mealPlanId, 
  1, 
  'breakfast', 
  meal.completed
)}>
  {meal.completed ? '✅ Completed' : '⭕ Mark as Complete'}
</button>
```

---

## 📥 Response

### **Success Response (200):**

```typescript
{
  "success": true,
  "message": "Meal updated successfully",
  "mealPlan": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user123",
    "name": "My Weekly Meal Plan",
    "days": [
      {
        "dayNumber": 1,
        "date": "2024-01-15T00:00:00.000Z",
        "meals": [
          {
            "recipeId": {
              "_id": "recipe123",
              "title": "Zabkása gyümölcsökkel",
              "caloriesPerServing": 300,
              "proteinPerServing": 10,
              // ... full recipe details
            },
            "recipeTitle": "Zabkása gyümölcsökkel",
            "mealType": "breakfast",
            "completed": true,                        // ✅ Updated
            "completedAt": "2024-01-15T08:30:00.000Z", // ✅ Timestamp added
            "notes": ""
          },
          {
            "recipeId": { /* lunch recipe */ },
            "mealType": "lunch",
            "completed": false,
            "completedAt": null,
            "notes": ""
          }
          // ... more meals
        ]
      }
      // ... more days
    ]
  }
}
```

---

## 🗄️ What Gets Logged in MealEntry

When you mark a meal as **completed**, this is what gets saved:

```typescript
{
  "_id": "mealentry123",
  "userId": "user123",
  "date": "2024-01-15",                    // Date from the meal plan day
  "mealType": "breakfast",                  // The meal type
  "foodId": "recipe123",                    // Reference to the recipe
  "name": "Zabkása gyümölcsökkel",         // Recipe name
  "quantityGrams": 100,                     // Serving size
  "calories": 300,                          // Nutritional info
  "protein": 10,
  "carbs": 45,
  "fat": 5,
  "createdAt": "2024-01-15T08:30:00.000Z"
}
```

When you mark it as **not completed**, this entry is **DELETED**.

---

## 📊 Complete React Component Example

```tsx
import { useState } from 'react';

interface Meal {
  recipeTitle: string;
  mealType: string;
  completed: boolean;
  completedAt?: Date;
  recipeId: {
    caloriesPerServing: number;
    proteinPerServing: number;
    carbsPerServing: number;
    fatPerServing: number;
  };
}

interface Day {
  dayNumber: number;
  date: Date;
  meals: Meal[];
}

export default function MealPlanDay({ 
  mealPlanId, 
  day 
}: { 
  mealPlanId: string; 
  day: Day;
}) {
  const [meals, setMeals] = useState(day.meals);
  const [loading, setLoading] = useState<string | null>(null);

  const toggleMealCompletion = async (mealType: string, isCompleted: boolean) => {
    setLoading(mealType);

    try {
      const response = await fetch(`/api/meal-plans/${mealPlanId}/meals`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dayNumber: day.dayNumber,
          mealType: mealType,
          updates: {
            completed: !isCompleted  // Toggle
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setMeals(meals.map(m => 
          m.mealType === mealType 
            ? { ...m, completed: !isCompleted, completedAt: !isCompleted ? new Date() : undefined }
            : m
        ));
      } else {
        alert('Error updating meal');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="meal-plan-day">
      <h2>Day {day.dayNumber}</h2>
      <p>{new Date(day.date).toLocaleDateString()}</p>

      <div className="meals-grid">
        {meals.map((meal) => (
          <div 
            key={meal.mealType} 
            className={`meal-card ${meal.completed ? 'completed' : ''}`}
          >
            <h3>{meal.recipeTitle}</h3>
            <p className="meal-type">{meal.mealType}</p>

            <div className="nutrition">
              <span>{meal.recipeId.caloriesPerServing} kcal</span>
              <span>{meal.recipeId.proteinPerServing}g protein</span>
              <span>{meal.recipeId.carbsPerServing}g carbs</span>
              <span>{meal.recipeId.fatPerServing}g fat</span>
            </div>

            <button
              onClick={() => toggleMealCompletion(meal.mealType, meal.completed)}
              disabled={loading === meal.mealType}
              className={meal.completed ? 'btn-completed' : 'btn-complete'}
            >
              {loading === meal.mealType ? (
                '⏳ Updating...'
              ) : meal.completed ? (
                '✅ Completed'
              ) : (
                '⭕ Mark as Complete'
              )}
            </button>

            {meal.completedAt && (
              <p className="completed-time">
                Completed at {new Date(meal.completedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎨 UI State Examples

### **Uncompleted Meal:**
```
┌────────────────────────────┐
│ 🍳 Zabkása gyümölcsökkel  │
│ breakfast                  │
│                            │
│ 300 kcal | 10g protein    │
│ 45g carbs | 5g fat        │
│                            │
│ [ ⭕ Mark as Complete ]    │
└────────────────────────────┘
```

### **Completed Meal:**
```
┌────────────────────────────┐
│ 🍳 Zabkása gyümölcsökkel  │
│ breakfast                  │
│                            │
│ 300 kcal | 10g protein    │
│ 45g carbs | 5g fat        │
│                            │
│ [ ✅ Completed ]           │
│ Completed at 8:30 AM       │
└────────────────────────────┘
```

---

## 🔄 Flow Diagram

```
User clicks "Mark as Complete"
          ↓
Frontend: PATCH /api/meal-plans/{id}/meals
Body: { dayNumber: 1, mealType: "breakfast", updates: { completed: true } }
          ↓
Backend: Find meal plan and specific meal
          ↓
Backend: Is completed = true?
          ↓
     YES → Create MealEntry
          ├─ userId
          ├─ date (from meal plan day)
          ├─ mealType
          ├─ foodId (recipe ID)
          ├─ nutrition data
          └─ Save to database
          ↓
Backend: Update meal.completed = true
Backend: Set meal.completedAt = new Date()
          ↓
Frontend: Update UI to show ✅ Completed
```

```
User clicks "✅ Completed" (to undo)
          ↓
Frontend: PATCH /api/meal-plans/{id}/meals
Body: { dayNumber: 1, mealType: "breakfast", updates: { completed: false } }
          ↓
Backend: Find meal plan and specific meal
          ↓
Backend: Is completed = false?
          ↓
     YES → Delete MealEntry
          ├─ Find by: userId, date, mealType, foodId
          └─ Delete from database
          ↓
Backend: Update meal.completed = false
Backend: Remove meal.completedAt
          ↓
Frontend: Update UI to show ⭕ Mark as Complete
```

---

## 🔑 Key Points

1. **Body Structure** - Always send:
   ```json
   {
     "dayNumber": 1,
     "mealType": "breakfast",
     "updates": {
       "completed": true  // or false
     }
   }
   ```

2. **Meal Types** - Valid values:
   - `"breakfast"`
   - `"lunch"`
   - `"dinner"`
   - `"dessert"`
   - `"snack"` (if supported)

3. **Day Number** - Starts at 1 (not 0)

4. **Idempotent** - Calling complete twice = same result (only one MealEntry)

5. **Date** - Uses the meal plan day's date, not today's date

---

## ❌ Error Responses

### **400 - Bad Request:**
```json
{
  "error": "Day number and meal type are required"
}
```

### **404 - Meal Plan Not Found:**
```json
{
  "error": "Meal plan not found"
}
```

### **404 - Day Not Found:**
```json
{
  "error": "Day not found"
}
```

### **404 - Meal Not Found:**
```json
{
  "error": "Meal not found"
}
```

---

## 🧪 Testing

### **Test 1: Complete a meal**
```bash
curl -X PATCH "http://localhost:3000/api/meal-plans/507f1f77bcf86cd799439011/meals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "dayNumber": 1,
    "mealType": "breakfast",
    "updates": {
      "completed": true
    }
  }'
```

### **Test 2: Uncomplete a meal**
```bash
curl -X PATCH "http://localhost:3000/api/meal-plans/507f1f77bcf86cd799439011/meals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "dayNumber": 1,
    "mealType": "breakfast",
    "updates": {
      "completed": false
    }
  }'
```

---

**Summary**: 
- ✅ **complete = true** → Creates MealEntry (logs meal)
- ❌ **complete = false** → Deletes MealEntry (removes log)
- Always send `dayNumber`, `mealType`, and `updates.completed` in body!

---

**Status**: ✅ Ready to Use  
**Last Updated**: 2024-01-10

