# AI Goal Planner API Documentation

## Overview
AI-powered fitness and nutrition goal planner that generates personalized calorie plans and progress roadmaps using OpenAI GPT-4o-mini.

---

## Endpoint: `/api/user/makeGoal`

### Authentication
Required - Bearer token or NextAuth session

---

## POST - Create Goal with AI Plan

### Request
```http
POST /api/user/makeGoal
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body
```json
{
  "goalType": "lose_weight",
  "targetWeight": 75,
  "durationDays": 90
}
```

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `goalType` | string | Yes | One of: `lose_weight`, `gain_weight`, `build_muscle`, `maintain_weight`, `improve_fitness`, `tone_body` |
| `targetWeight` | number | Yes | Target weight in kg (1-1000) |
| `durationDays` | number | Yes | Duration in days (1-1825, i.e., up to 5 years) |

**Note:** User must have their current weight set in their profile. If not, the API will return a 400 error.

---

### Response (200 OK)

```json
{
  "message": "Goal set successfully",
  "goal": {
    "goalType": "lose_weight",
    "targetWeight": 75,
    "durationDays": 90,
    "plan": {
      "maintenanceCalories": 2480,
      "goalCaloriesStart": 1984,
      "goalCaloriesEnd": 1984,
      "averageDailyDeficitOrSurplusKcal": -496,
      "expectedTotalWeightChangeKg": -5,
      "targetWeightKg": 75,
      "calorieSchedule": [
        {
          "period": "Week 1",
          "caloriesToConsume": 2200,
          "caloriesToBurn": 400,
          "netCalories": 1800,
          "averageWeeklyWeightChangeKg": -0.5
        },
        {
          "period": "Week 2",
          "caloriesToConsume": 2200,
          "caloriesToBurn": 450,
          "netCalories": 1750,
          "averageWeeklyWeightChangeKg": -0.5
        },
        {
          "period": "Week 3",
          "caloriesToConsume": 2200,
          "caloriesToBurn": 500,
          "netCalories": 1700,
          "averageWeeklyWeightChangeKg": -0.5
        }
        // ... continues for all weeks
      ],
      "progressMilestones": [
        {
          "period": "Week 1",
          "targetWeightKg": 79.5
        },
        {
          "period": "Week 2",
          "targetWeightKg": 79
        },
        {
          "period": "Week 3",
          "targetWeightKg": 78.5
        }
        // ... continues for all weeks
      ],
      "notes": [
        "Stay consistent with your calorie intake for the best results.",
        "Drink plenty of water, aim for at least 2-3 liters daily.",
        "Incorporate strength training to maintain muscle mass during weight loss.",
        "Track your progress weekly but don't obsess over daily fluctuations.",
        "Get adequate sleep (7-9 hours) to support your weight loss journey.",
        "Consider meal prepping to stay on track with your calorie goals.",
        "Listen to your body; if you feel too tired, consider increasing calories slightly.",
        "Celebrate small victories along the way to stay motivated!"
      ]
    },
    "createdAt": "2024-10-28T12:00:00.000Z"
  }
}
```

### AI Plan Generation Logic

The AI automatically determines:

1. **Maintenance Calories**: Based on current weight (~31 kcal × body weight in kg)
2. **Goal Calories**: 
   - **Lose weight**: 15-25% calorie deficit
   - **Gain weight**: 10-20% calorie surplus
   - **Maintain**: Same as maintenance
3. **Schedule Type**:
   - Duration ≤ 90 days (3 months) → **Weekly schedule**
   - Duration > 90 days → **Monthly schedule**
4. **Calorie Breakdown** (for each period):
   - **Calories to Consume**: How much to eat (1500-3000 kcal/day)
   - **Calories to Burn**: Exercise target (200-600 kcal/day)
   - **Net Calories**: consume - burn = actual deficit/surplus
5. **Realistic Progress**:
   - Weight loss: 0.4-0.7 kg/week
   - Weight gain: 0.2-0.4 kg/week
6. **Educational Notes**: 8-12 tips for both nutrition and exercise

---

### Error Responses

#### 400 - Missing Parameters
```json
{
  "message": "goalType, targetWeight, and durationDays are required"
}
```

#### 400 - No Weight Set
```json
{
  "message": "User weight is required. Please update your profile first."
}
```

#### 401 - Unauthorized
```json
{
  "message": "Unauthorized"
}
```

#### 404 - User Not Found
```json
{
  "message": "User not found"
}
```

#### 500 - AI Generation Failed
```json
{
  "message": "Failed to generate AI plan",
  "error": "OpenAI error message"
}
```

---

## GET - Retrieve Current Goal and Plan

### Request
```http
GET /api/user/makeGoal
Authorization: Bearer <token>
```

### Response (200 OK)
```json
{
  "goal": {
    "goalType": "lose_weight",
    "targetWeight": 75,
    "durationDays": 90,
    "plan": {
      "maintenanceCalories": 2480,
      "goalCaloriesStart": 1984,
      "goalCaloriesEnd": 1984,
      "averageDailyDeficitOrSurplusKcal": -496,
      "expectedTotalWeightChangeKg": -5,
      "targetWeightKg": 75,
      "calorieSchedule": [...],
      "progressMilestones": [...],
      "notes": [...]
    },
    "createdAt": "2024-10-28T12:00:00.000Z"
  }
}
```

### Error Responses

#### 404 - No Goal Set
```json
{
  "message": "No goal set yet. Please create a goal first."
}
```

---

## Usage Examples

### Example 1: Weight Loss Plan (3 months)
```bash
curl -X POST https://your-api.com/api/user/makeGoal \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "goalType": "lose_weight",
    "targetWeight": 70,
    "durationDays": 90
  }'
```

**Result**: Weekly schedule for 12-13 weeks with calorie deficit

### Example 2: Muscle Gain Plan (6 months)
```bash
curl -X POST https://your-api.com/api/user/makeGoal \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "goalType": "gain_weight",
    "targetWeight": 85,
    "durationDays": 180
  }'
```

**Result**: Monthly schedule for 6 months with calorie surplus

### Example 3: Maintenance Plan (1 year)
```bash
curl -X POST https://your-api.com/api/user/makeGoal \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "goalType": "maintain_weight",
    "targetWeight": 80,
    "durationDays": 365
  }'
```

**Result**: Monthly schedule for 12 months at maintenance calories

### Example 4: Retrieve Current Goal
```bash
curl -X GET https://your-api.com/api/user/makeGoal \
  -H "Authorization: Bearer <token>"
```

---

## Data Structure

### User Model Updates
```typescript
goal?: {
  goalType?: 'lose_weight' | 'gain_weight' | 'build_muscle' | 'maintain_weight' | 'improve_fitness' | 'tone_body';
  targetWeight?: number;
  durationDays?: number;
  plan?: {
    maintenanceCalories?: number;
    goalCaloriesStart?: number;
    goalCaloriesEnd?: number;
    averageDailyDeficitOrSurplusKcal?: number;
    expectedTotalWeightChangeKg?: number;
    targetWeightKg?: number;
      calorieSchedule?: Array<{
        period: string;
        caloriesToConsume: number;
        caloriesToBurn: number;
        netCalories: number;
        averageWeeklyWeightChangeKg: number;
      }>;
    progressMilestones?: Array<{
      period: string;
      targetWeightKg: number;
    }>;
    notes?: string[];
  };
  createdAt?: Date;
}
```

---

## Frontend Integration

### Flutter Example
```dart
// Create goal with AI plan
Future<Map<String, dynamic>> createGoalPlan({
  required String goalType,
  required double targetWeight,
  required int durationDays,
}) async {
  final response = await http.post(
    Uri.parse('$apiUrl/api/user/makeGoal'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'goalType': goalType,
      'targetWeight': targetWeight,
      'durationDays': durationDays,
    }),
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to create goal plan');
  }
}

// Get current goal
Future<Map<String, dynamic>> getCurrentGoal() async {
  final response = await http.get(
    Uri.parse('$apiUrl/api/user/makeGoal'),
    headers: {
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to get goal');
  }
}
```

### React/Next.js Example
```typescript
// Create goal with AI plan
async function createGoalPlan(goalType: string, targetWeight: number, durationDays: number) {
  const response = await fetch('/api/user/makeGoal', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      goalType,
      targetWeight,
      durationDays,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Get current goal
async function getCurrentGoal() {
  const response = await fetch('/api/user/makeGoal', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch goal');
  }

  return await response.json();
}
```

---

## Features

### ✅ AI-Powered Plan Generation
- Personalized calorie targets based on current weight and goal
- Realistic weight change expectations
- Adaptive schedule (weekly or monthly)
- Educational notes and motivation

### ✅ Smart Scheduling
- **Short-term** (≤3 months): Weekly breakdown
- **Long-term** (>3 months): Monthly breakdown
- Automatic adjustment based on duration

### ✅ Comprehensive Tracking
- Calorie schedule for entire duration
- Progress milestones with target weights
- Motivational and educational notes
- Expected total weight change

### ✅ Flexible Goals
Supports 6 goal types:
1. Lose weight
2. Gain weight
3. Build muscle
4. Maintain weight
5. Improve fitness
6. Tone body

---

## Best Practices

1. **Set Realistic Goals**: Choose achievable targets and reasonable timeframes
2. **Update Profile First**: Ensure weight is set before creating a goal
3. **Track Progress**: Use the plan as a guide, adjust if needed
4. **Stay Consistent**: Follow the calorie targets consistently
5. **Monitor Results**: Check milestones regularly and adjust as needed

---

## Notes

- Plans are stored in the user's profile
- Creating a new goal overwrites the previous one
- The AI uses realistic health guidelines (no extreme diets)
- Plans account for sustainable weight change rates
- All calculations are based on average activity levels

---

**Last Updated**: 2024-10-28  
**Status**: ✅ Complete and Ready for Production  
**AI Model**: OpenAI GPT-4o-mini

