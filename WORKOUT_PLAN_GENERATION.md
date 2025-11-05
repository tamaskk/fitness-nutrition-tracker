# Workout Plan Generation via Fitness Chatbot

## Overview

The fitness chatbot now automatically generates personalized workout plans by selecting random exercises from your database based on the user's selected muscle groups and desired number of exercises per muscle group.

---

## How It Works

### Step 1: User Requests Training Plan

```
User: "Create a workout plan"
```

**API Response:**
```json
{
  "success": true,
  "category": "general",
  "responseType": "muscleGroup",
  "needsMoreInfo": true,
  "pendingCategory": "training",
  "response": "Which muscle groups do you want to focus on? Select one or more:",
  "conversationHistory": [...]
}
```

### Step 2: User Selects Muscle Groups

```
User: "Chest, Back, Shoulders"
```

**API Response:**
```json
{
  "success": true,
  "category": "general",
  "responseType": "exerciseNumber",
  "needsMoreInfo": true,
  "pendingCategory": "training",
  "response": "How many exercises per muscle group would you like?",
  "conversationHistory": [...]
}
```

### Step 3: User Selects Exercise Count

```
User: "4 exercises"
```

**API Response with Workout Plan:**
```json
{
  "success": true,
  "category": "training",
  "response": "training",
  "workoutPlan": {
    "muscleGroups": [
      {
        "name": "chest",
        "exerciseCount": 4
      },
      {
        "name": "back",
        "exerciseCount": 4
      },
      {
        "name": "shoulders",
        "exerciseCount": 4
      }
    ],
    "exercises": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Bench Press",
        "muscleGroup": "chest",
        "description": "Classic compound chest exercise",
        "instructions": [
          "Lie on bench",
          "Grip bar slightly wider than shoulders",
          "Lower to chest",
          "Press up explosively"
        ],
        "equipment": "Barbell",
        "difficulty": "intermediate",
        "sets": 3,
        "reps": 10,
        "rest": 60,
        "image": "https://example.com/bench-press.gif"
      },
      // ... 11 more exercises (4 for each muscle group)
    ],
    "totalExercises": 12
  },
  "conversationHistory": [...],
  "timestamp": "2025-11-05T20:00:00.000Z",
  "messageCount": 6
}
```

---

## Database Query Logic

### Muscle Group Mapping

The system automatically maps user input (including Hungarian) to database muscle groups:

| User Input | Database Value |
|------------|----------------|
| "Chest", "Mellkas", "Mell" | `chest` |
| "Back", "Hát", "Hat" | `back` |
| "Legs", "Láb", "Lab" | `legs` |
| "Shoulders", "Váll", "Vall" | `shoulders` |
| "Arms", "Kar" | `arms` |
| "Biceps" | `biceps` |
| "Triceps", "Tricepsz" | `triceps` |
| "Abs", "Has", "Core" | `core` |
| "Glutes", "Far" | `glutes` |
| "Full Body", "Teljes test" | `full-body` |

### Exercise Selection Algorithm

```typescript
async function generateWorkoutPlan(muscleGroups: string[], exercisesPerMuscle: number) {
  const workoutPlan = {
    muscleGroups: [],
    exercises: [],
    totalExercises: 0,
  };

  for (const muscleGroup of muscleGroups) {
    // 1. Query exercises for this muscle group
    const exercises = await Exercise.find({
      muscleGroups: { $in: [muscleGroup] }
    }).limit(100);

    // 2. Randomly shuffle exercises
    const shuffled = exercises.sort(() => 0.5 - Math.random());
    
    // 3. Select N exercises (or all if less than N available)
    const count = Math.min(exercisesPerMuscle, shuffled.length);
    
    // 4. Add to workout plan
    for (let i = 0; i < count; i++) {
      const exercise = shuffled[i];
      workoutPlan.exercises.push({
        id: exercise._id.toString(),
        name: exercise.name,
        muscleGroup: muscleGroup,
        description: exercise.description,
        instructions: exercise.instructions,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        sets: exercise.sets || 3,
        reps: exercise.reps || 10,
        rest: exercise.rest || 60,
        image: exercise.image,
      });
    }
  }

  return workoutPlan;
}
```

---

## Exercise Data Structure

Each exercise returned in the workout plan includes:

```typescript
{
  id: string;                    // MongoDB _id
  name: string;                  // Exercise name (e.g., "Bench Press")
  muscleGroup: string;           // Target muscle group
  description?: string;          // Brief description
  instructions?: string[];       // Step-by-step instructions
  equipment?: string;            // Required equipment
  difficulty: string;            // "beginner" | "intermediate" | "advanced"
  sets: number;                  // Default: 3
  reps: number;                  // Default: 10
  rest: number;                  // Rest seconds between sets (default: 60)
  image?: string;                // Exercise image/gif URL
}
```

---

## Frontend Integration

### Request (Step 3 - After selecting exercise count)

```typescript
const response = await fetch('/api/fitness/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    message: '4 exercises',
    conversationHistory: [
      { role: 'user', content: 'Create workout plan', timestamp: '...' },
      { role: 'assistant', content: 'muscleGroup', timestamp: '...' },
      { role: 'user', content: 'Chest, Back, Shoulders', timestamp: '...' },
      { role: 'assistant', content: 'exerciseNumber', timestamp: '...' },
    ],
  }),
});

const data = await response.json();
```

### Response Handling

```typescript
if (data.category === 'training' && data.workoutPlan) {
  // Display workout plan to user
  console.log('Total exercises:', data.workoutPlan.totalExercises);
  
  // Group exercises by muscle group
  data.workoutPlan.muscleGroups.forEach((group) => {
    console.log(`${group.name}: ${group.exerciseCount} exercises`);
  });
  
  // Display individual exercises
  data.workoutPlan.exercises.forEach((exercise) => {
    console.log(`
      ${exercise.name}
      Muscle: ${exercise.muscleGroup}
      Sets: ${exercise.sets} x ${exercise.reps} reps
      Rest: ${exercise.rest}s
      Difficulty: ${exercise.difficulty}
    `);
  });
}
```

### Flutter Example

```dart
class WorkoutPlanResponse {
  final bool success;
  final String category;
  final WorkoutPlan? workoutPlan;
  final List<ChatMessage> conversationHistory;

  WorkoutPlanResponse.fromJson(Map<String, dynamic> json)
      : success = json['success'],
        category = json['category'],
        workoutPlan = json['workoutPlan'] != null 
            ? WorkoutPlan.fromJson(json['workoutPlan'])
            : null,
        conversationHistory = (json['conversationHistory'] as List)
            .map((msg) => ChatMessage.fromJson(msg))
            .toList();
}

class WorkoutPlan {
  final List<MuscleGroupSummary> muscleGroups;
  final List<Exercise> exercises;
  final int totalExercises;

  WorkoutPlan.fromJson(Map<String, dynamic> json)
      : muscleGroups = (json['muscleGroups'] as List)
            .map((g) => MuscleGroupSummary.fromJson(g))
            .toList(),
        exercises = (json['exercises'] as List)
            .map((e) => Exercise.fromJson(e))
            .toList(),
        totalExercises = json['totalExercises'];
}

class MuscleGroupSummary {
  final String name;
  final int exerciseCount;

  MuscleGroupSummary.fromJson(Map<String, dynamic> json)
      : name = json['name'],
        exerciseCount = json['exerciseCount'];
}

class Exercise {
  final String id;
  final String name;
  final String muscleGroup;
  final String? description;
  final List<String>? instructions;
  final String? equipment;
  final String difficulty;
  final int sets;
  final int reps;
  final int rest;
  final String? image;

  Exercise.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        name = json['name'],
        muscleGroup = json['muscleGroup'],
        description = json['description'],
        instructions = json['instructions'] != null
            ? List<String>.from(json['instructions'])
            : null,
        equipment = json['equipment'],
        difficulty = json['difficulty'],
        sets = json['sets'],
        reps = json['reps'],
        rest = json['rest'],
        image = json['image'];
}

// Usage in UI
Widget buildWorkoutPlan(WorkoutPlan plan) {
  return ListView.builder(
    itemCount: plan.exercises.length,
    itemBuilder: (context, index) {
      final exercise = plan.exercises[index];
      return Card(
        child: ListTile(
          leading: exercise.image != null
              ? Image.network(exercise.image!)
              : Icon(Icons.fitness_center),
          title: Text(exercise.name),
          subtitle: Text(
            '${exercise.sets} sets × ${exercise.reps} reps\n'
            'Rest: ${exercise.rest}s\n'
            '${exercise.equipment ?? 'No equipment'}',
          ),
          trailing: Chip(
            label: Text(exercise.difficulty),
            backgroundColor: _getDifficultyColor(exercise.difficulty),
          ),
        ),
      );
    },
  );
}
```

---

## Smart Defaults

If the system can't extract specific details from the conversation:

- **Default muscle groups:** `['chest', 'back', 'legs']`
- **Default exercise count:** `3` per muscle group

Example:
```
User: "Give me a workout"
→ No specific details provided
→ System generates: 3 exercises each for chest, back, and legs (9 total)
```

---

## Randomization

- Each request generates a **different** workout
- Exercises are randomly selected from the available pool
- This provides variety across multiple workout plan requests

**Example:**

```
Request 1: "Chest, 3 exercises"
→ Bench Press, Incline Dumbbell Press, Cable Flyes

Request 2: "Chest, 3 exercises" (same input, different output)
→ Dumbbell Press, Push-ups, Chest Dips
```

---

## Handling Missing Exercises

If a muscle group has **no exercises** in the database:

```javascript
if (exercises.length === 0) {
  console.log(`No exercises found for muscle group: ${muscleGroup}`);
  continue; // Skip this muscle group
}
```

The workout plan will simply exclude that muscle group.

---

## Example Full Flow

### Request 1: Start

```bash
curl -X POST https://your-api.com/api/fitness/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Create a workout plan",
    "conversationHistory": []
  }'
```

**Response:**
```json
{
  "responseType": "muscleGroup",
  "response": "Which muscle groups do you want to focus on? Select one or more:"
}
```

### Request 2: Select Muscle Groups

```bash
curl -X POST https://your-api.com/api/fitness/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Hát, Váll",
    "conversationHistory": [
      {"role": "user", "content": "Create a workout plan", "timestamp": "..."},
      {"role": "assistant", "content": "muscleGroup", "timestamp": "..."}
    ]
  }'
```

**Response:**
```json
{
  "responseType": "exerciseNumber",
  "response": "How many exercises per muscle group would you like?"
}
```

### Request 3: Select Exercise Count

```bash
curl -X POST https://your-api.com/api/fitness/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "5 gyakorlat",
    "conversationHistory": [
      {"role": "user", "content": "Create a workout plan", "timestamp": "..."},
      {"role": "assistant", "content": "muscleGroup", "timestamp": "..."},
      {"role": "user", "content": "Hát, Váll", "timestamp": "..."},
      {"role": "assistant", "content": "exerciseNumber", "timestamp": "..."}
    ]
  }'
```

**Response:**
```json
{
  "category": "training",
  "workoutPlan": {
    "muscleGroups": [
      {"name": "back", "exerciseCount": 5},
      {"name": "shoulders", "exerciseCount": 5}
    ],
    "exercises": [
      // 10 total exercises (5 for back, 5 for shoulders)
    ],
    "totalExercises": 10
  }
}
```

---

## Testing

### Test 1: Basic Flow

```javascript
// Step 1
POST /api/fitness/chat
Body: { message: "workout plan", conversationHistory: [] }
→ Should return responseType: "muscleGroup"

// Step 2
POST /api/fitness/chat
Body: { message: "chest", conversationHistory: [...] }
→ Should return responseType: "exerciseNumber"

// Step 3
POST /api/fitness/chat
Body: { message: "3 exercises", conversationHistory: [...] }
→ Should return workoutPlan with 3 chest exercises
```

### Test 2: Multiple Muscle Groups

```javascript
POST /api/fitness/chat
Body: { message: "chest, back, legs", conversationHistory: [...] }
→ Should return responseType: "exerciseNumber"

POST /api/fitness/chat
Body: { message: "4", conversationHistory: [...] }
→ Should return workoutPlan with 12 exercises (4 per muscle group)
```

### Test 3: Hungarian Language

```javascript
POST /api/fitness/chat
Body: { message: "Hát, Váll, Mellkas", conversationHistory: [...] }
→ Should detect: back, shoulders, chest

POST /api/fitness/chat
Body: { message: "5 gyakorlat", conversationHistory: [...] }
→ Should detect: 5 exercises per muscle
→ Should return workoutPlan with 15 exercises
```

---

## Logs

When a workout plan is generated, you'll see these console logs:

```
Has all required details, generating workout plan...
Muscle groups: ['back', 'shoulders']
Exercise count: 5
No exercises found for muscle group: shoulders  ← If no exercises available
```

---

## Summary

✅ **Structured Multi-Step Flow**
- Step 1: Ask for muscle groups
- Step 2: Ask for exercise count
- Step 3: Generate workout plan

✅ **Database Integration**
- Queries Exercise collection by muscle group
- Random selection for variety

✅ **Multi-Language Support**
- English and Hungarian muscle group detection
- Number word parsing ("three" → 3, "négy" → 4)

✅ **Smart Defaults**
- Default muscle groups if none detected
- Default exercise count if none specified

✅ **Complete Exercise Data**
- Name, description, instructions
- Sets, reps, rest time
- Equipment, difficulty, images

✅ **Frontend Ready**
- Returns structured JSON
- Easy to parse and display
- TypeScript/Flutter examples provided

🎯 **Result:** Users get personalized, randomized workout plans through a conversational interface!

