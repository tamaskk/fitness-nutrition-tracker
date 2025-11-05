# ExerciseDB Workout Plan Return Format

## 📋 TypeScript Types

```typescript
// ExerciseDB API Response Type
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

// Type for workout plan exercise (what we return)
interface WorkoutExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
  muscleGroup: string;  // Added: Original requested muscle group
  sets: number;         // Added: Default 3
  reps: number;         // Added: Default 10
  rest: number;         // Added: Rest seconds (default 60)
}
```

---

## 🎯 Example API Response

### User Selections:
- **Muscle Groups:** Back, Shoulders
- **Exercise Count:** 3 per muscle group

### Full Response:

```json
{
  "success": true,
  "category": "training",
  "response": "training",
  "workoutPlan": {
    "muscleGroups": [
      {
        "name": "back",
        "bodyPart": "back",
        "exerciseCount": 3
      },
      {
        "name": "shoulders",
        "bodyPart": "shoulders",
        "exerciseCount": 3
      }
    ],
    "exercises": [
      {
        "exerciseId": "dmgMp3n",
        "name": "barbell incline row",
        "gifUrl": "https://static.exercisedb.dev/media/dmgMp3n.gif",
        "targetMuscles": [
          "upper back"
        ],
        "bodyParts": [
          "back"
        ],
        "equipments": [
          "barbell"
        ],
        "secondaryMuscles": [
          "biceps",
          "forearms"
        ],
        "instructions": [
          "Step:1 Set up an incline bench at a 45-degree angle.",
          "Step:2 Lie face down on the bench with your chest against the pad and your feet flat on the ground.",
          "Step:3 Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.",
          "Step:4 Keep your back straight and your core engaged.",
          "Step:5 Pull the barbell towards your chest, squeezing your shoulder blades together.",
          "Step:6 Pause for a moment at the top, then slowly lower the barbell back to the starting position.",
          "Step:7 Repeat for the desired number of repetitions."
        ],
        "muscleGroup": "back",
        "sets": 3,
        "reps": 10,
        "rest": 60
      },
      {
        "exerciseId": "abc123x",
        "name": "bent over dumbbell row",
        "gifUrl": "https://static.exercisedb.dev/media/abc123x.gif",
        "targetMuscles": [
          "lats",
          "upper back"
        ],
        "bodyParts": [
          "back"
        ],
        "equipments": [
          "dumbbell"
        ],
        "secondaryMuscles": [
          "biceps",
          "rear deltoids"
        ],
        "instructions": [
          "Step:1 Stand with feet shoulder-width apart, holding dumbbells.",
          "Step:2 Bend forward at the hips with a slight knee bend.",
          "Step:3 Keep your back straight and core tight.",
          "Step:4 Pull dumbbells up towards your chest, squeezing shoulder blades.",
          "Step:5 Lower dumbbells back to starting position with control.",
          "Step:6 Repeat for desired reps."
        ],
        "muscleGroup": "back",
        "sets": 3,
        "reps": 10,
        "rest": 60
      },
      {
        "exerciseId": "xyz789p",
        "name": "pull-up",
        "gifUrl": "https://static.exercisedb.dev/media/xyz789p.gif",
        "targetMuscles": [
          "lats",
          "upper back"
        ],
        "bodyParts": [
          "back"
        ],
        "equipments": [
          "body weight"
        ],
        "secondaryMuscles": [
          "biceps",
          "forearms",
          "core"
        ],
        "instructions": [
          "Step:1 Grip pull-up bar with hands slightly wider than shoulder-width.",
          "Step:2 Hang with arms fully extended.",
          "Step:3 Pull yourself up until chin is above the bar.",
          "Step:4 Lower yourself back down with control.",
          "Step:5 Repeat for desired reps."
        ],
        "muscleGroup": "back",
        "sets": 3,
        "reps": 10,
        "rest": 60
      },
      {
        "exerciseId": "def456s",
        "name": "dumbbell shoulder press",
        "gifUrl": "https://static.exercisedb.dev/media/def456s.gif",
        "targetMuscles": [
          "anterior deltoid",
          "lateral deltoid"
        ],
        "bodyParts": [
          "shoulders"
        ],
        "equipments": [
          "dumbbell"
        ],
        "secondaryMuscles": [
          "triceps",
          "upper chest"
        ],
        "instructions": [
          "Step:1 Sit on a bench with back support.",
          "Step:2 Hold dumbbells at shoulder level with palms facing forward.",
          "Step:3 Press dumbbells overhead until arms are fully extended.",
          "Step:4 Lower dumbbells back to shoulder level with control.",
          "Step:5 Repeat for desired reps."
        ],
        "muscleGroup": "shoulders",
        "sets": 3,
        "reps": 10,
        "rest": 60
      },
      {
        "exerciseId": "ghi789l",
        "name": "lateral raise",
        "gifUrl": "https://static.exercisedb.dev/media/ghi789l.gif",
        "targetMuscles": [
          "lateral deltoid"
        ],
        "bodyParts": [
          "shoulders"
        ],
        "equipments": [
          "dumbbell"
        ],
        "secondaryMuscles": [
          "anterior deltoid",
          "trapezius"
        ],
        "instructions": [
          "Step:1 Stand with feet shoulder-width apart, holding dumbbells at sides.",
          "Step:2 Keep a slight bend in elbows.",
          "Step:3 Raise dumbbells out to the sides until arms are parallel to floor.",
          "Step:4 Pause at the top, then lower with control.",
          "Step:5 Repeat for desired reps."
        ],
        "muscleGroup": "shoulders",
        "sets": 3,
        "reps": 10,
        "rest": 60
      },
      {
        "exerciseId": "jkl012f",
        "name": "face pull",
        "gifUrl": "https://static.exercisedb.dev/media/jkl012f.gif",
        "targetMuscles": [
          "posterior deltoid",
          "upper back"
        ],
        "bodyParts": [
          "shoulders"
        ],
        "equipments": [
          "cable"
        ],
        "secondaryMuscles": [
          "trapezius",
          "rhomboids"
        ],
        "instructions": [
          "Step:1 Attach rope to cable machine at face height.",
          "Step:2 Grab rope with overhand grip.",
          "Step:3 Pull rope towards face, separating hands as you pull.",
          "Step:4 Squeeze shoulder blades together at the end.",
          "Step:5 Return to start position with control.",
          "Step:6 Repeat for desired reps."
        ],
        "muscleGroup": "shoulders",
        "sets": 3,
        "reps": 10,
        "rest": 60
      }
    ],
    "totalExercises": 6
  },
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create a workout plan",
      "timestamp": "2025-11-05T20:30:00.000Z"
    },
    {
      "role": "assistant",
      "content": "muscleGroup",
      "timestamp": "2025-11-05T20:30:01.000Z"
    },
    {
      "role": "user",
      "content": "Back, Shoulders",
      "timestamp": "2025-11-05T20:30:15.000Z"
    },
    {
      "role": "assistant",
      "content": "exerciseNumber",
      "timestamp": "2025-11-05T20:30:16.000Z"
    },
    {
      "role": "user",
      "content": "3 exercises",
      "timestamp": "2025-11-05T20:30:25.000Z"
    },
    {
      "role": "assistant",
      "content": "training",
      "timestamp": "2025-11-05T20:30:28.000Z"
    }
  ],
  "timestamp": "2025-11-05T20:30:28.000Z",
  "messageCount": 6
}
```

---

## 🔗 API Endpoints Used

The system uses ExerciseDB API endpoints:

### Muscles Endpoint (Primary):
```
GET https://www.exercisedb.dev/api/v1/muscles/{muscleName}/exercises
```

**Example:**
```bash
# Get back exercises
GET https://www.exercisedb.dev/api/v1/muscles/back/exercises

# Get shoulder exercises
GET https://www.exercisedb.dev/api/v1/muscles/shoulders/exercises
```

### Muscle Group Mapping:

| User Input | ExerciseDB API Muscle |
|------------|----------------------|
| chest | chest |
| back | back |
| legs | upper legs |
| shoulders | shoulders |
| arms | upper arms |
| biceps | upper arms |
| triceps | upper arms |
| core | waist |
| glutes | upper legs |
| full-body | cardio |

---

## 📊 Response Structure Breakdown

### 1. Workout Plan Summary
```json
{
  "muscleGroups": [
    {
      "name": "back",           // Original user selection
      "bodyPart": "back",       // ExerciseDB API parameter
      "exerciseCount": 3        // Number of exercises selected
    }
  ]
}
```

### 2. Individual Exercise
```json
{
  // From ExerciseDB API:
  "exerciseId": "dmgMp3n",
  "name": "barbell incline row",
  "gifUrl": "https://static.exercisedb.dev/media/dmgMp3n.gif",
  "targetMuscles": ["upper back"],
  "bodyParts": ["back"],
  "equipments": ["barbell"],
  "secondaryMuscles": ["biceps", "forearms"],
  "instructions": ["Step:1 ...", "Step:2 ..."],
  
  // Added by our system:
  "muscleGroup": "back",  // User's original selection
  "sets": 3,              // Default workout structure
  "reps": 10,
  "rest": 60              // Rest time in seconds
}
```

---

## 🎨 Frontend Display Example

### Workout Summary Card
```
📋 Your Workout Plan
━━━━━━━━━━━━━━━━━━━━
Total: 6 exercises

Back (3 exercises)
Shoulders (3 exercises)
```

### Exercise Card
```
┌─────────────────────────────────────┐
│ [GIF]   Barbell Incline Row         │
│                                      │
│ 🎯 Target: Upper Back               │
│ 💪 Secondary: Biceps, Forearms      │
│ 🏋️ Equipment: Barbell               │
│                                      │
│ Sets: 3  |  Reps: 10  |  Rest: 60s  │
│                                      │
│ Instructions:                        │
│ 1. Set up an incline bench...       │
│ 2. Lie face down on the bench...    │
│ 3. Grasp the barbell...              │
│                                      │
└─────────────────────────────────────┘
```

---

## 🧪 Test the API

### Request:
```bash
curl -X POST https://your-api.com/api/fitness/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "3 exercises",
    "conversationHistory": [
      {"role": "user", "content": "Create workout", "timestamp": "..."},
      {"role": "assistant", "content": "muscleGroup", "timestamp": "..."},
      {"role": "user", "content": "Back, Shoulders", "timestamp": "..."},
      {"role": "assistant", "content": "exerciseNumber", "timestamp": "..."}
    ]
  }'
```

### Response:
- ✅ `category`: "training"
- ✅ `workoutPlan`: Complete workout with exercises from ExerciseDB
- ✅ Each exercise includes: ID, name, GIF URL, instructions, muscles, equipment
- ✅ Ready to display in your Flutter app!

---

## 🔄 How It Works

1. **User selects:** "Back, Shoulders" + "3 exercises"
2. **System maps:** "back" → "back", "shoulders" → "shoulders"
3. **API calls:**
   - `GET /api/v1/muscles/back/exercises` → Gets all back exercises
   - `GET /api/v1/muscles/shoulders/exercises` → Gets all shoulder exercises
4. **Randomization:** Shuffles each list and selects 3 random exercises
5. **Enhancement:** Adds `sets`, `reps`, `rest`, `muscleGroup` to each exercise
6. **Returns:** Complete workout plan with 6 exercises (3 back + 3 shoulders)

---

## ✨ Key Features

✅ **Real Exercise Database** - ExerciseDB has 1000+ exercises with GIFs
✅ **Detailed Instructions** - Step-by-step guide for each exercise
✅ **Visual GIFs** - Animated demonstrations for proper form
✅ **Equipment Info** - Know what you need before starting
✅ **Muscle Targeting** - Primary and secondary muscles engaged
✅ **Random Variety** - Different exercises each time for same muscle group
✅ **Ready for Display** - All data needed for beautiful UI

---

## 🚀 Next Steps

The workout plan is now **100% ready** to be:
1. ✅ Displayed in Flutter app with exercise cards
2. ✅ Saved to user's workout plans via `/api/workout-plans` (POST)
3. ✅ Used for workout tracking
4. ✅ Modified by user (adjust sets/reps/rest)

**ExerciseDB provides professional-quality exercise data!** 💪

