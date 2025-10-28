# Workout Plan Set Number Fix

## Problem
The error you were seeing:
```
"exercises.0.sets.0.setNumber: Path `setNumber` is required."
```

This happened because the MongoDB schema requires a `setNumber` field for each set, but the frontend wasn't sending it.

## Solution ✅
**The API now auto-generates `setNumber` based on the array index!**

---

## What Changed in the Backend

### Before (Broken)
```typescript
sets: Array.isArray(ex.sets) ? ex.sets.map((s: any) => ({
  setNumber: s.setNumber,  // ❌ This was undefined!
  weight: typeof s.weight === 'number' ? s.weight : Number(s.weight) || 10,
  reps: typeof s.reps === 'number' ? s.reps : Number(s.reps) || 0,
  restSeconds: typeof s.restSeconds === 'number' ? s.restSeconds : Number(s.restSeconds) || 60,
  isCompleted: !!s.isCompleted,
})) : [],
```

### After (Fixed)
```typescript
sets: Array.isArray(ex.sets) ? ex.sets.map((s: any, index: number) => ({
  setNumber: s.setNumber !== undefined ? s.setNumber : index + 1,  // ✅ Auto-generated!
  weight: typeof s.weight === 'number' ? s.weight : Number(s.weight) || 10,
  reps: typeof s.reps === 'number' ? s.reps : Number(s.reps) || 0,
  restSeconds: typeof s.restSeconds === 'number' ? s.restSeconds : Number(s.restSeconds) || 60,
  isCompleted: !!s.isCompleted,
})) : [],
```

**Key Change:**
- If `setNumber` is provided, it uses that value
- If `setNumber` is not provided (undefined), it generates: `index + 1`
- First set → `setNumber: 1`
- Second set → `setNumber: 2`
- Third set → `setNumber: 3`
- etc.

---

## Frontend - What You Need to Know

### ✅ You DON'T Need to Send `setNumber`
The backend will automatically assign set numbers based on the order in your array.

### Example: Creating a Workout Plan
```typescript
const createWorkoutPlan = async () => {
  const response = await fetch('https://your-api.com/api/workout-plans', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: "Upper Body Strength",
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
          instructions: ["Step 1", "Step 2"],
          notes: "Focus on form",
          sets: [
            // ✅ No need to send setNumber!
            { weight: 60, reps: 10, restSeconds: 90 },
            { weight: 65, reps: 8, restSeconds: 90 },
            { weight: 70, reps: 6, restSeconds: 90 }
          ]
        }
      ],
      isCustom: false,
      notes: "Beginner friendly"
    }),
  });

  return await response.json();
};
```

**What the backend will save:**
```json
{
  "sets": [
    { "setNumber": 1, "weight": 60, "reps": 10, "restSeconds": 90, "isCompleted": false },
    { "setNumber": 2, "weight": 65, "reps": 8, "restSeconds": 90, "isCompleted": false },
    { "setNumber": 3, "weight": 70, "reps": 6, "restSeconds": 90, "isCompleted": false }
  ]
}
```

### Example: Updating Sets (Add a New Set)
```typescript
const addSetToExercise = async (planId, exercises, exerciseIndex) => {
  const updatedExercises = [...exercises];
  
  // Add a new set (don't worry about setNumber)
  updatedExercises[exerciseIndex].sets.push({
    weight: 75,
    reps: 4,
    restSeconds: 120
  });
  
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

  return await response.json();
};
```

### Example: Updating Sets (Remove a Set)
```typescript
const removeSet = async (planId, exercises, exerciseIndex, setIndexToRemove) => {
  const updatedExercises = [...exercises];
  
  // Remove the set at the specified index
  updatedExercises[exerciseIndex].sets.splice(setIndexToRemove, 1);
  
  // Backend will automatically renumber: 1, 2, 3, ...
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

  return await response.json();
};
```

---

## Optional: You CAN Still Send `setNumber` If You Want

If for some reason you want to explicitly set the set numbers (e.g., for custom ordering), you can still send it:

```typescript
const sets = [
  { setNumber: 3, weight: 70, reps: 6, restSeconds: 90 },
  { setNumber: 1, weight: 60, reps: 10, restSeconds: 90 },
  { setNumber: 2, weight: 65, reps: 8, restSeconds: 90 }
];
```

The backend will respect your provided `setNumber` values.

---

## Summary

### ✅ Fixed
- Backend now auto-generates `setNumber` when not provided
- No more validation errors about missing `setNumber`
- Both POST and PUT endpoints updated

### ✅ No Frontend Changes Required
- You can keep your existing code as-is
- Just don't send `setNumber` in the sets array
- The backend handles it automatically

### ✅ Endpoints Fixed
- `POST /api/workout-plans` (create)
- `PUT /api/workout-plans/[id]` (update)

---

## Test It Out

Try updating your workout plan now with this request body:

```json
{
  "exercises": [
    {
      "exerciseId": "0001",
      "name": "Bench Press",
      "gifUrl": "https://...",
      "targetMuscles": ["pectorals"],
      "bodyParts": ["chest"],
      "equipments": ["barbell"],
      "secondaryMuscles": [],
      "instructions": ["Lie down", "Press up"],
      "notes": "",
      "sets": [
        { "weight": 60, "reps": 10, "restSeconds": 90 }
      ]
    }
  ]
}
```

**Expected result:** ✅ Success! The set will be saved with `setNumber: 1` automatically.


