# Workout Plans API Documentation

## Overview
Complete API documentation for managing workout plans with exercises, sets, and muscle group tracking.

---

## Authentication
All endpoints require authentication via:
- **Bearer Token** in Authorization header: `Authorization: Bearer <token>`
- **Session** via NextAuth

---

## Endpoints

### 1. GET /api/workout-plans
**Get All Workout Plans for the authenticated user**

#### Request
```http
GET /api/workout-plans?page=1&limit=20&sortBy=savedAt&order=desc
Authorization: Bearer <token>
```

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Number of items per page |
| `sortBy` | string | 'savedAt' | Field to sort by (savedAt, name, totalExercises, lastModified) |
| `order` | string | 'desc' | Sort order ('asc' or 'desc') |

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "68fcfccf3d8f517069994175",
      "userId": "68efbe3bc19240d05e72ad23",
      "name": "Upper Body Strength",
      "muscleGroups": [
        {
          "muscleName": "chest",
          "bodyPart": "upper body",
          "exerciseCount": 3
        },
        {
          "muscleName": "shoulders",
          "bodyPart": "upper body",
          "exerciseCount": 2
        }
      ],
      "exercises": [
        {
          "exerciseId": "0001",
          "name": "Barbell Bench Press",
          "gifUrl": "https://example.com/bench-press.gif",
          "targetMuscles": ["pectorals"],
          "bodyParts": ["chest"],
          "equipments": ["barbell"],
          "secondaryMuscles": ["triceps"],
          "instructions": [
            "Lie on bench",
            "Grip barbell slightly wider than shoulders",
            "Lower to chest",
            "Press up explosively"
          ],
          "notes": "Focus on form",
          "sets": [
            {
              "setNumber": 1,
              "weight": 60,
              "reps": 10,
              "restSeconds": 90,
              "isCompleted": false
            },
            {
              "setNumber": 2,
              "weight": 65,
              "reps": 8,
              "restSeconds": 90,
              "isCompleted": false
            }
          ]
        }
      ],
      "totalExercises": 5,
      "savedAt": "2024-01-15T10:00:00.000Z",
      "lastModified": "2024-01-15T10:00:00.000Z",
      "isCustom": false,
      "notes": "Beginner friendly"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### Response (401 Unauthorized)
```json
{
  "message": "Unauthorized"
}
```

---

### 2. POST /api/workout-plans
**Create a New Workout Plan**

#### Request
```http
POST /api/workout-plans
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "Upper Body Strength",
  "muscleGroups": [
    {
      "muscleName": "chest",
      "bodyPart": "upper body",
      "exerciseCount": 3
    },
    {
      "muscleName": "shoulders",
      "bodyPart": "upper body",
      "exerciseCount": 2
    }
  ],
  "exercises": [
    {
      "exerciseId": "0001",
      "name": "Barbell Bench Press",
      "gifUrl": "https://example.com/bench-press.gif",
      "targetMuscles": ["pectorals"],
      "bodyParts": ["chest"],
      "equipments": ["barbell"],
      "secondaryMuscles": ["triceps"],
      "instructions": [
        "Lie on bench",
        "Grip barbell slightly wider than shoulders"
      ],
      "notes": "Focus on form",
      "sets": [
        {
          "weight": 60,
          "reps": 10,
          "restSeconds": 90
        },
        {
          "weight": 65,
          "reps": 8,
          "restSeconds": 90
        }
      ]
    }
  ],
  "isCustom": false,
  "notes": "Beginner friendly"
}
```

**📝 Important Notes:**
- `setNumber` is **automatically generated** (index + 1) if not provided
- `sets` array: if you send 3 sets without `setNumber`, they will be numbered 1, 2, 3
- All set fields have defaults:
  - `weight`: 10
  - `reps`: 0
  - `restSeconds`: 60
  - `isCompleted`: false

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Workout plan saved successfully",
  "data": {
    "_id": "68fcfccf3d8f517069994175",
    "userId": "68efbe3bc19240d05e72ad23",
    "name": "Upper Body Strength",
    "muscleGroups": [...],
    "exercises": [...],
    "totalExercises": 5,
    "savedAt": "2024-01-15T10:00:00.000Z",
    "lastModified": "2024-01-15T10:00:00.000Z",
    "isCustom": false,
    "notes": "Beginner friendly"
  }
}
```

#### Response (400 Bad Request)
```json
{
  "message": "Missing required fields: name, muscleGroups, exercises"
}
```

---

### 3. GET /api/workout-plans/[id]
**Get Single Workout Plan by ID**

#### Request
```http
GET /api/workout-plans/68fcfccf3d8f517069994175
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "68fcfccf3d8f517069994175",
    "userId": "68efbe3bc19240d05e72ad23",
    "name": "Upper Body Strength",
    "muscleGroups": [...],
    "exercises": [...],
    "totalExercises": 5,
    "savedAt": "2024-01-15T10:00:00.000Z",
    "lastModified": "2024-01-15T10:00:00.000Z",
    "isCustom": false,
    "notes": "Beginner friendly"
  }
}
```

#### Response (404 Not Found)
```json
{
  "message": "Workout plan not found or unauthorized"
}
```

---

### 4. PUT /api/workout-plans/[id]
**Update Workout Plan (Add/Remove Exercises, Update Sets)**

#### Request
```http
PUT /api/workout-plans/68fcfccf3d8f517069994175
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body (All fields optional)
```json
{
  "name": "Updated Plan Name",
  "muscleGroups": [
    {
      "muscleName": "chest",
      "bodyPart": "upper body",
      "exerciseCount": 4
    }
  ],
  "exercises": [
    {
      "exerciseId": "0001",
      "name": "Barbell Bench Press",
      "gifUrl": "https://example.com/bench-press.gif",
      "targetMuscles": ["pectorals"],
      "bodyParts": ["chest"],
      "equipments": ["barbell"],
      "secondaryMuscles": [],
      "instructions": [...],
      "notes": "Focus on form",
      "sets": [
        {
          "weight": 60,
          "reps": 10,
          "restSeconds": 90
        }
      ]
    },
    {
      "exerciseId": "0002",
      "name": "Dumbbell Shoulder Press",
      "gifUrl": "https://example.com/shoulder-press.gif",
      "targetMuscles": ["deltoids"],
      "bodyParts": ["shoulders"],
      "equipments": ["dumbbell"],
      "secondaryMuscles": ["triceps"],
      "instructions": [...],
      "notes": "",
      "sets": [
        {
          "weight": 20,
          "reps": 12,
          "restSeconds": 60
        }
      ]
    }
  ],
  "isCustom": true,
  "notes": "Updated notes"
}
```

**📝 Important Notes:**
- Send only the fields you want to update
- If you send `exercises` array, it will **replace** the entire exercises array
- `setNumber` is **auto-generated** if not provided
- `lastModified` is automatically updated
- `totalExercises` is automatically calculated from exercises.length

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Workout plan updated successfully",
  "data": {
    "_id": "68fcfccf3d8f517069994175",
    "userId": "68efbe3bc19240d05e72ad23",
    "name": "Updated Plan Name",
    "muscleGroups": [...],
    "exercises": [...],
    "totalExercises": 6,
    "savedAt": "2024-01-15T10:00:00.000Z",
    "lastModified": "2024-01-16T14:30:00.000Z",
    "isCustom": true,
    "notes": "Updated notes"
  }
}
```

#### Response (404 Not Found)
```json
{
  "message": "Workout plan not found or unauthorized"
}
```

#### Response (500 Internal Server Error)
```json
{
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

---

### 5. DELETE /api/workout-plans/[id]
**Delete a Workout Plan**

#### Request
```http
DELETE /api/workout-plans/68fcfccf3d8f517069994175
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Workout plan deleted successfully"
}
```

#### Response (404 Not Found)
```json
{
  "message": "Workout plan not found or unauthorized"
}
```

---

## Data Models

### WorkoutPlan Schema
```typescript
{
  _id: ObjectId,
  userId: string,                    // User's ObjectId as string
  name: string,                      // Plan name (required)
  muscleGroups: MuscleGroup[],       // Array of muscle groups
  exercises: Exercise[],             // Array of exercises
  totalExercises: number,            // Auto-calculated count
  savedAt: Date,                     // Creation date
  lastModified: Date,                // Last update date
  isCustom: boolean,                 // Whether plan is user-created
  notes: string                      // Optional notes
}
```

### MuscleGroup Schema
```typescript
{
  muscleName: string,                // e.g., "chest", "shoulders"
  bodyPart: string,                  // e.g., "upper body", "lower body"
  exerciseCount: number              // Number of exercises targeting this muscle
}
```

### Exercise Schema
```typescript
{
  exerciseId: string,                // Unique exercise ID (required)
  name: string,                      // Exercise name (required)
  gifUrl: string,                    // GIF URL (required)
  targetMuscles: string[],           // Primary muscles targeted
  bodyParts: string[],               // Body parts involved
  equipments: string[],              // Equipment needed
  secondaryMuscles: string[],        // Secondary muscles involved
  instructions: string[],            // Step-by-step instructions
  notes: string,                     // Exercise-specific notes
  sets: Set[]                        // Array of sets
}
```

### Set Schema
```typescript
{
  setNumber: number,                 // Set number (1, 2, 3, ...) - AUTO-GENERATED if not provided
  weight: number,                    // Weight in kg (default: 10)
  reps: number,                      // Number of reps (default: 0)
  restSeconds: number,               // Rest time in seconds (default: 60)
  isCompleted: boolean               // Whether set is completed (default: false)
}
```

---

## Frontend Usage Examples

### 1. Get All Workout Plans
```typescript
const getWorkoutPlans = async (page = 1, limit = 20) => {
  const response = await fetch(
    `https://your-api.com/api/workout-plans?page=${page}&limit=${limit}&sortBy=savedAt&order=desc`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();
  return result.data; // Array of workout plans
};
```

### 2. Create Workout Plan
```typescript
const createWorkoutPlan = async (planData) => {
  const response = await fetch('https://your-api.com/api/workout-plans', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: "My Workout Plan",
      muscleGroups: [
        {
          muscleName: "chest",
          bodyPart: "upper body",
          exerciseCount: 2
        }
      ],
      exercises: [
        {
          exerciseId: "0001",
          name: "Bench Press",
          gifUrl: "https://...",
          targetMuscles: ["pectorals"],
          bodyParts: ["chest"],
          equipments: ["barbell"],
          secondaryMuscles: [],
          instructions: ["Lie on bench", "Press bar up"],
          notes: "",
          sets: [
            { weight: 60, reps: 10, restSeconds: 90 },
            { weight: 65, reps: 8, restSeconds: 90 }
          ]
        }
      ],
      isCustom: false,
      notes: ""
    }),
  });

  const result = await response.json();
  return result.data;
};
```

### 3. Update Workout Plan (Add Exercise)
```typescript
const addExerciseToPlan = async (planId, currentExercises, newExercise) => {
  const updatedExercises = [...currentExercises, newExercise];
  
  const response = await fetch(`https://your-api.com/api/workout-plans/${planId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      exercises: updatedExercises // This replaces the entire exercises array
    }),
  });

  const result = await response.json();
  return result.data;
};
```

### 4. Update Workout Plan (Update Sets)
```typescript
const updateExerciseSets = async (planId, exercises, exerciseIndex, newSets) => {
  const updatedExercises = [...exercises];
  updatedExercises[exerciseIndex].sets = newSets;
  
  const response = await fetch(`https://your-api.com/api/workout-plans/${planId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      exercises: updatedExercises
    }),
  });

  const result = await response.json();
  return result.data;
};
```

### 5. Delete Workout Plan
```typescript
const deleteWorkoutPlan = async (planId) => {
  const response = await fetch(`https://your-api.com/api/workout-plans/${planId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  return result;
};
```

---

## Common Errors & Solutions

### ❌ Error: "setNumber is required"
**Solution:** This is now auto-generated! Just send sets without `setNumber`:
```json
{
  "sets": [
    { "weight": 60, "reps": 10, "restSeconds": 90 }
  ]
}
```

### ❌ Error: "Missing required fields: name, muscleGroups, exercises"
**Solution:** Ensure you're sending all required fields in POST request:
```json
{
  "name": "...",
  "muscleGroups": [...],
  "exercises": [...]
}
```

### ❌ Error: "Workout plan not found or unauthorized"
**Solution:** 
- Check that the workout plan ID is correct
- Ensure the plan belongs to the authenticated user
- Verify authentication token is valid

---

## Important Notes

1. **Set Numbers Auto-Generated**: When creating or updating exercises, `setNumber` is automatically assigned based on array index (1, 2, 3...). You don't need to send it from the frontend.

2. **Replace vs Update**: When updating exercises, sending the `exercises` array **replaces the entire array**. Make sure to send all exercises, not just the ones you want to update.

3. **Authentication**: All endpoints require authentication. Use either Bearer token or NextAuth session.

4. **Ownership**: Users can only access, modify, or delete their own workout plans. The API enforces this at the database query level.

5. **Date Format**: All dates are returned in ISO 8601 format (e.g., `2024-01-15T10:00:00.000Z`).

6. **Pagination**: GET /api/workout-plans supports pagination. Default is 20 items per page.

---

## Summary for Meal Entries API

### GET /api/meals
**Get meal entries for a specific date**

#### Request
```http
GET /api/meals?date=2024-01-15
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
[
  {
    "_id": "...",
    "userId": "...",
    "date": "2024-01-15",
    "mealType": "breakfast",
    "foodId": "...",
    "name": "Chicken Pasta",
    "quantityGrams": 100,
    "calories": 450,
    "protein": 30,
    "carbs": 50,
    "fat": 15,
    "createdAt": "2024-01-15T08:30:00.000Z"
  }
]
```

This is the API you use to **fetch completed meals** (MealEntry documents) that were created when users completed meals in their meal plans.


