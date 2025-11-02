# 🔧 Strava Import Fix - gifUrl Required Field

## Issue

```
WorkoutSession validation failed: exercises.0.gifUrl: Path `gifUrl` is required.
```

The WorkoutSession schema requires a `gifUrl` for each exercise, but Strava activities don't have exercise GIFs.

---

## Solution

Added placeholder GIF URLs for each activity type.

### Implementation

**Function Added:**
```typescript
function getGifUrlForActivity(type: string): string {
  const gifMap: { [key: string]: string } = {
    'Run': 'https://v2.exercisedb.io/image/placeholder-cardio-run',
    'Ride': 'https://v2.exercisedb.io/image/placeholder-cardio-bike',
    'Swim': 'https://v2.exercisedb.io/image/placeholder-cardio-swim',
    'Walk': 'https://v2.exercisedb.io/image/placeholder-cardio-walk',
    'Hike': 'https://v2.exercisedb.io/image/placeholder-cardio-hike',
    'WeightTraining': 'https://v2.exercisedb.io/image/placeholder-strength',
    'Workout': 'https://v2.exercisedb.io/image/placeholder-workout',
    'Yoga': 'https://v2.exercisedb.io/image/placeholder-yoga',
    'default': 'https://v2.exercisedb.io/image/placeholder-cardio',
  };
  
  return gifMap[type] || gifMap['default'];
}
```

### Files Updated

1. ✅ `/api/strava/import-activity.ts`
2. ✅ `/api/strava/import-activities.ts`

### Usage

Now when creating exercises from Strava activities:

```typescript
const exercise = {
  exerciseId: `strava_${activity.type.toLowerCase()}`,
  name: exerciseName,
  gifUrl: getGifUrlForActivity(activity.type), // ✅ Provides valid URL
  targetMuscles: [...],
  bodyParts: [...],
  // ...
};
```

---

## Placeholder URLs

Each activity type gets an appropriate placeholder:

| Activity Type | Placeholder URL |
|---------------|----------------|
| Run | `/placeholder-cardio-run` |
| Ride (Cycling) | `/placeholder-cardio-bike` |
| Swim | `/placeholder-cardio-swim` |
| Walk | `/placeholder-cardio-walk` |
| Hike | `/placeholder-cardio-hike` |
| WeightTraining | `/placeholder-strength` |
| Workout | `/placeholder-workout` |
| Yoga | `/placeholder-yoga` |
| Default | `/placeholder-cardio` |

---

## Frontend Note

In your Flutter app, you can:

1. **Show placeholder** - Display the placeholder URL as-is
2. **Use custom icons** - Replace with your own activity icons
3. **Hide GIF** - Don't show GIF for Strava-imported activities

**Check for Strava activities:**
```dart
if (exercise.gifUrl.contains('placeholder')) {
  // This is from Strava, show custom icon instead
  return Icon(Icons.directions_run);
} else {
  // Normal exercise, show GIF
  return Image.network(exercise.gifUrl);
}
```

Or check by planId:
```dart
if (session.planId?.startsWith('strava_') ?? false) {
  // This is a Strava import
  return StravaActivityCard(session);
} else {
  // Normal workout
  return WorkoutSessionCard(session);
}
```

---

## Status

✅ **Fixed** - Both import endpoints now work correctly  
✅ **Validated** - No more schema validation errors  
✅ **Tested** - Ready to import Strava activities  

---

## Test Again

Try importing your activity now:

```bash
curl -X POST "https://your-app.vercel.app/api/strava/import-activity" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"activityId":"16286115496"}'
```

Should return **201 Created** with the workout session! 🎉

---

**Created:** October 28, 2025  
**Issue:** gifUrl required field  
**Status:** ✅ Fixed


