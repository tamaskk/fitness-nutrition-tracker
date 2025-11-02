# 🏋️ Strava → Workout Sessions Import

## Overview
Import Strava activities as WorkoutSessions to track all your training in one place!

---

## 🎯 New Endpoints

### 1. **POST /api/strava/import-activity**
Import a single Strava activity as a WorkoutSession

### 2. **POST /api/strava/import-activities** 
Import multiple Strava activities at once (bulk)

---

## 📊 Single Activity Import

### `POST /api/strava/import-activity`

**Purpose:** Convert one Strava activity into a WorkoutSession

**Request:**
```bash
POST /api/strava/import-activity
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body:**
```json
{
  "activityId": "16286115496"
}
```

**Response (Success - 201):**
```json
{
  "message": "Activity imported successfully",
  "session": {
    "_id": "672024a1234567890abcdef0",
    "userId": "68efbe3bc19240d05e72ad23",
    "planId": "strava_16286115496",
    "workoutPlanName": "Morning Run",
    "exercises": [
      {
        "exerciseId": "strava_run",
        "name": "Running",
        "gifUrl": "",
        "targetMuscles": ["quadriceps", "hamstrings", "calves", "glutes"],
        "bodyParts": ["legs", "cardio"],
        "equipments": ["none"],
        "sets": [
          {
            "setNumber": 1,
            "weight": 0,
            "reps": 0,
            "restSeconds": 0,
            "isCompleted": true
          }
        ],
        "notes": "Distance: 5.25 km, Avg Speed: 10.5 km/h, Elevation: 45m"
      }
    ],
    "startTime": "2025-10-28T06:30:00.000Z",
    "endTime": "2025-10-28T07:00:00.000Z",
    "durationSeconds": 1800,
    "totalSets": 1,
    "completedSets": 1,
    "caloriesBurned": 350,
    "status": "completed",
    "createdAt": "2025-10-28T06:30:00.000Z"
  }
}
```

**Response (Already Imported - 409):**
```json
{
  "message": "Activity already imported",
  "session": { ... }
}
```

**Response (Not Connected - 400):**
```json
{
  "message": "Strava not connected. Please connect your Strava account first."
}
```

---

## 📦 Bulk Activity Import

### `POST /api/strava/import-activities`

**Purpose:** Import multiple Strava activities at once

**Request:**
```bash
POST /api/strava/import-activities
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body:**
```json
{
  "activityIds": [
    "16286115496",
    "16285234567",
    "16284123456"
  ]
}
```

**Response (200):**
```json
{
  "message": "Import completed",
  "summary": {
    "total": 3,
    "imported": 2,
    "skipped": 1,
    "failed": 0
  },
  "imported": [
    {
      "activityId": "16286115496",
      "name": "Morning Run"
    },
    {
      "activityId": "16285234567",
      "name": "Evening Ride"
    }
  ],
  "skipped": [
    {
      "activityId": "16284123456",
      "reason": "Already imported"
    }
  ],
  "failed": []
}
```

---

## 🔄 How It Works

### Data Mapping

**Strava Activity → WorkoutSession:**

| Strava Field | WorkoutSession Field | Transformation |
|--------------|---------------------|----------------|
| `id` | `planId` | `strava_{id}` |
| `name` | `workoutPlanName` | Direct copy |
| `type` | `exercises[0].name` | Mapped (Run→Running, etc.) |
| `start_date` | `startTime` | Parsed to Date |
| `elapsed_time` | `durationSeconds` | Direct copy (seconds) |
| `distance` | `exercises[0].notes` | Converted to km |
| `average_speed` | `exercises[0].notes` | Converted to km/h |
| `calories` | `caloriesBurned` | Direct or estimated |
| `kilojoules` | `exercises[0].notes` | Added to notes |

### Activity Type Mapping

| Strava Type | Exercise Name | Target Muscles |
|-------------|--------------|----------------|
| Run | Running | Quadriceps, Hamstrings, Calves, Glutes |
| Ride | Cycling | Quadriceps, Hamstrings, Calves, Glutes |
| Swim | Swimming | Lats, Shoulders, Triceps, Core |
| Walk | Walking | Quadriceps, Calves |
| Hike | Hiking | Quadriceps, Hamstrings, Calves, Glutes |
| WeightTraining | Weight Training | Full Body |
| Workout | Workout | Full Body |
| Yoga | Yoga | Full Body |

### Calorie Estimation

If Strava doesn't provide calories, we estimate based on:
- Activity type
- Duration (moving time)
- Calories per hour defaults

**Estimated Rates:**
- Running: 600 kcal/hour
- Cycling: 400 kcal/hour
- Swimming: 500 kcal/hour
- Walking: 250 kcal/hour
- Hiking: 400 kcal/hour
- Weight Training: 350 kcal/hour
- Other: 300 kcal/hour

---

## 📱 Flutter Integration

### Import Single Activity

```dart
Future<Map<String, dynamic>> importStravaActivity(String activityId) async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('auth_token');
  
  final response = await http.post(
    Uri.parse('$apiUrl/api/strava/import-activity'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'activityId': activityId,
    }),
  );
  
  if (response.statusCode == 201) {
    return jsonDecode(response.body);
  } else if (response.statusCode == 409) {
    // Already imported
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to import activity');
  }
}
```

### Import Multiple Activities

```dart
Future<Map<String, dynamic>> importStravaActivities(List<String> activityIds) async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('auth_token');
  
  final response = await http.post(
    Uri.parse('$apiUrl/api/strava/import-activities'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'activityIds': activityIds,
    }),
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    print('Imported: ${data['summary']['imported']}');
    print('Skipped: ${data['summary']['skipped']}');
    print('Failed: ${data['summary']['failed']}');
    return data;
  } else {
    throw Exception('Failed to import activities');
  }
}
```

### UI Example: Import Button

```dart
// In your activities list
ListTile(
  title: Text(activity.name),
  subtitle: Text('${activity.distance / 1000} km'),
  trailing: IconButton(
    icon: Icon(Icons.download),
    onPressed: () async {
      try {
        await importStravaActivity(activity.id.toString());
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Activity imported to workouts!')),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to import: $e')),
        );
      }
    },
  ),
)
```

### Complete Import Flow

```dart
class StravaActivitiesScreen extends StatelessWidget {
  Future<void> importRecentActivities() async {
    // 1. Get recent activities
    final activities = await getStravaActivities(perPage: 10);
    
    // 2. Extract activity IDs
    final activityIds = activities
      .map((a) => a.id.toString())
      .toList();
    
    // 3. Import all at once
    final result = await importStravaActivities(activityIds);
    
    // 4. Show results
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Import Complete'),
        content: Text(
          'Imported: ${result['summary']['imported']}\n'
          'Skipped: ${result['summary']['skipped']}\n'
          'Failed: ${result['summary']['failed']}'
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Strava Activities'),
        actions: [
          IconButton(
            icon: Icon(Icons.cloud_download),
            onPressed: importRecentActivities,
            tooltip: 'Import Recent Activities',
          ),
        ],
      ),
      body: ActivityList(),
    );
  }
}
```

---

## 🔍 Duplicate Prevention

**How it works:**
- Uses `planId: strava_{activityId}` format
- Checks for existing sessions before import
- Returns 409 (Conflict) if already exists
- Bulk import skips duplicates automatically

**Check if imported:**
```dart
Future<bool> isActivityImported(String activityId) async {
  final sessions = await getWorkoutSessions();
  return sessions.any((s) => s.planId == 'strava_$activityId');
}
```

---

## ⚡ Performance Notes

### Single Import
- ~1 second per activity
- Includes full Strava API call
- Suitable for individual imports

### Bulk Import
- ~0.1 second delay between activities
- Prevents rate limiting
- Suitable for importing 10-50 activities
- For more, consider pagination

**Rate Limiting:**
- Strava: 100 requests per 15 minutes
- Bulk import respects this automatically

---

## 🧪 Testing

### Import One Activity
```bash
curl -X POST "https://your-app.vercel.app/api/strava/import-activity" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"activityId":"16286115496"}'
```

### Import Multiple
```bash
curl -X POST "https://your-app.vercel.app/api/strava/import-activities" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"activityIds":["16286115496","16285234567"]}'
```

---

## 📊 What Gets Stored

Each imported activity becomes a WorkoutSession with:

✅ **Activity Details**
- Name and type
- Start/end times
- Duration

✅ **Performance Metrics**
- Distance
- Average speed
- Elevation gain
- Energy (kilojoules)

✅ **Training Data**
- Calories burned
- Target muscles
- Body parts worked
- Equipment used

✅ **Tracking**
- Unique Strava ID
- Import timestamp
- Completed status

---

## 🎯 Use Cases

### 1. **Automatic Training Log**
Import all Strava activities to have complete workout history

### 2. **Calorie Tracking**
All cardio activities count toward daily calorie burn

### 3. **Progress Monitoring**
View running/cycling progress alongside gym workouts

### 4. **Unified Dashboard**
See all training in one place (app + Strava)

### 5. **Historical Import**
Import past activities to build complete training history

---

## 🚀 Quick Start

**1. Connect Strava**
```dart
await launchUrl(Uri.parse('$apiUrl/api/strava/oauth/authorize'));
```

**2. Get Activities**
```dart
final activities = await getStravaActivities(perPage: 30);
```

**3. Import All**
```dart
final ids = activities.map((a) => a.id.toString()).toList();
await importStravaActivities(ids);
```

**4. View in Workout History**
- All imported activities appear in workout sessions
- Marked with `strava_` prefix in planId
- Show as completed workouts

---

## ✅ Benefits

✅ **Unified Tracking** - All workouts in one place  
✅ **Automatic Sync** - Import with one click  
✅ **No Duplicates** - Smart duplicate detection  
✅ **Rich Data** - Distance, pace, elevation, calories  
✅ **Flexible** - Import one or many activities  
✅ **Fast** - Bulk import optimized for speed  

---

**Created:** October 28, 2025  
**Endpoints:** 2 (single + bulk)  
**Status:** ✅ Ready to Use

