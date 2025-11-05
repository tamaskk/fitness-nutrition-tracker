# ExerciseDB Workout API - Quick Reference

## 📦 Types

```typescript
// What ExerciseDB returns
interface ExerciseDBExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

// What we return (ExerciseDB + workout params)
interface WorkoutExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
  muscleGroup: string;  // Added
  sets: number;         // Added (default: 3)
  reps: number;         // Added (default: 10)
  rest: number;         // Added (default: 60s)
}
```

---

## 🎯 Example Return

```json
{
  "success": true,
  "category": "training",
  "workoutPlan": {
    "muscleGroups": [
      { "name": "back", "bodyPart": "back", "exerciseCount": 3 }
    ],
    "exercises": [
      {
        "exerciseId": "dmgMp3n",
        "name": "barbell incline row",
        "gifUrl": "https://static.exercisedb.dev/media/dmgMp3n.gif",
        "targetMuscles": ["upper back"],
        "bodyParts": ["back"],
        "equipments": ["barbell"],
        "secondaryMuscles": ["biceps", "forearms"],
        "instructions": [
          "Step:1 Set up an incline bench at a 45-degree angle.",
          "Step:2 Lie face down on the bench...",
          "..."
        ],
        "muscleGroup": "back",
        "sets": 3,
        "reps": 10,
        "rest": 60
      }
    ],
    "totalExercises": 3
  }
}
```

---

## 🔗 API Endpoints Used

```bash
GET https://www.exercisedb.dev/api/v1/muscles/{muscleName}/exercises
```

### Muscle Mapping:
- chest → chest
- back → back
- legs → upper legs
- shoulders → shoulders
- arms/biceps/triceps → upper arms
- core → waist
- glutes → upper legs

---

## ✅ What Changed

**Before:** Used local MongoDB Exercise collection
**Now:** Fetches from ExerciseDB API with 1000+ exercises

**Benefits:**
- ✅ Professional GIF demonstrations
- ✅ Detailed step-by-step instructions
- ✅ Equipment requirements
- ✅ Primary & secondary muscles
- ✅ Always up-to-date exercise database

---

## 🧪 Quick Test

```bash
# Step 1: Ask for workout
POST /api/fitness/chat
{"message": "Create workout plan"}
→ responseType: "muscleGroup"

# Step 2: Select muscles
POST /api/fitness/chat
{"message": "Back, Shoulders"}
→ responseType: "exerciseNumber"

# Step 3: Get workout plan
POST /api/fitness/chat
{"message": "3 exercises"}
→ Returns workoutPlan with ExerciseDB data!
```

---

## 📱 Flutter Usage

```dart
final exercise = workoutPlan.exercises[0];

// Display
Text(exercise.name);                  // "barbell incline row"
Image.network(exercise.gifUrl);       // Show exercise GIF
Text('${exercise.sets}x${exercise.reps}');  // "3x10"
Text('Rest: ${exercise.rest}s');      // "Rest: 60s"

// Instructions
for (final step in exercise.instructions) {
  Text(step);  // "Step:1 Set up an incline bench..."
}

// Equipment needed
Text(exercise.equipments.join(', '));  // "barbell"

// Muscles worked
Text('Target: ${exercise.targetMuscles.join(', ')}');
Text('Secondary: ${exercise.secondaryMuscles.join(', ')}');
```

---

## 🚀 Ready to Use!

The chatbot now returns **professional exercise data** from ExerciseDB with animated GIFs and detailed instructions! 💪

