# Calorie Schedule Update - Separate Consumption and Burn Values

## Overview
Updated the AI Goal Planner to provide **separate values** for calories to consume (eat) and calories to burn (exercise) for each period in the schedule, giving users a more comprehensive and actionable fitness plan.

---

## 🔄 What Changed

### Before (Old Format)
```json
{
  "period": "Week 1",
  "dailyCalorieTarget": 1984,
  "averageWeeklyWeightChangeKg": -0.5
}
```

**Problem**: Single target didn't separate eating from exercise, making it unclear how much to eat vs. how much to burn.

### After (New Format) ✅
```json
{
  "period": "Week 1",
  "caloriesToConsume": 2200,
  "caloriesToBurn": 400,
  "netCalories": 1800,
  "averageWeeklyWeightChangeKg": -0.5
}
```

**Benefits**: 
- ✅ Clear nutrition target (how much to eat)
- ✅ Clear exercise target (how much to burn)
- ✅ Net calorie calculation for transparency
- ✅ More actionable and realistic planning

---

## 📊 Field Definitions

### `caloriesToConsume`
- **What**: Daily calorie intake from food
- **Range**: Typically 1500-3000 kcal/day
- **Purpose**: Tells user how much they should eat each day
- **Example**: 2200 kcal → eat this amount from food

### `caloriesToBurn`
- **What**: Daily calorie expenditure from exercise
- **Range**: Typically 200-600 kcal/day
- **Purpose**: Tells user their daily exercise target
- **Example**: 400 kcal → burn through 30-45 min exercise

### `netCalories`
- **What**: `caloriesToConsume - caloriesToBurn`
- **Purpose**: Actual calorie balance for the day
- **For weight loss**: Negative or below maintenance
- **For weight gain**: Positive or above maintenance
- **Example**: 2200 - 400 = 1800 net calories

### `averageWeeklyWeightChangeKg`
- **What**: Expected weight change per week
- **Weight loss**: Negative value (e.g., -0.5 kg)
- **Weight gain**: Positive value (e.g., +0.3 kg)
- **Maintain**: Near 0

---

## 🎯 Example Plans

### Weight Loss Plan (3 months)
```json
{
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
      "averageWeeklyWeightChangeKg": -0.6
    }
  ]
}
```

**Interpretation**:
- **Eat** ~2200 calories per day
- **Burn** 400-500 calories through exercise
- **Result**: Net deficit of ~500-600 calories/day
- **Expected**: Lose 0.5-0.6 kg per week

### Muscle Gain Plan (6 months)
```json
{
  "calorieSchedule": [
    {
      "period": "Month 1",
      "caloriesToConsume": 2800,
      "caloriesToBurn": 300,
      "netCalories": 2500,
      "averageWeeklyWeightChangeKg": 0.3
    },
    {
      "period": "Month 2",
      "caloriesToConsume": 2900,
      "caloriesToBurn": 350,
      "netCalories": 2550,
      "averageWeeklyWeightChangeKg": 0.3
    }
  ]
}
```

**Interpretation**:
- **Eat** ~2800-2900 calories per day
- **Burn** 300-350 calories (moderate exercise)
- **Result**: Net surplus of ~200-250 calories/day
- **Expected**: Gain 0.3 kg per week

---

## 🔧 Technical Changes

### 1. AI Prompt Update (`makeGoal.ts`)
```typescript
const SYSTEM_PROMPT = `
...
3. For each period, calculate SEPARATELY:
   - Calories to consume (eat from food)
   - Calories to burn (through exercise/activity)
...
"calorie_schedule": [
  {
    "period": "Week 1" | "Month 1" | ...,
    "calories_to_consume": number,
    "calories_to_burn": number,
    "net_calories": number,
    "average_weekly_weight_change_kg": number
  }
]
...
`;
```

### 2. Data Mapping Update
```typescript
calorieSchedule: aiGeneratedPlan.calorie_schedule?.map((item: any) => ({
  period: item.period,
  caloriesToConsume: item.calories_to_consume,      // NEW
  caloriesToBurn: item.calories_to_burn,            // NEW
  netCalories: item.net_calories,                   // NEW
  averageWeeklyWeightChangeKg: item.average_weekly_weight_change_kg,
})) || []
```

### 3. User Model Update (`User.ts`)
```typescript
calorieSchedule: [{
  period: { type: String },
  caloriesToConsume: { type: Number },      // NEW
  caloriesToBurn: { type: Number },         // NEW
  netCalories: { type: Number },            // NEW
  averageWeeklyWeightChangeKg: { type: Number },
}]
```

### 4. TypeScript Interface Update (`types/index.ts`)
```typescript
calorieSchedule?: Array<{
  period: string;
  caloriesToConsume: number;      // NEW
  caloriesToBurn: number;         // NEW
  netCalories: number;            // NEW
  averageWeeklyWeightChangeKg: number;
}>;
```

---

## 📱 Frontend Integration

### Display Schedule
```dart
// Flutter example
ListView.builder(
  itemCount: schedule.length,
  itemBuilder: (context, index) {
    final item = schedule[index];
    return Card(
      child: Column(
        children: [
          Text(item.period, style: TextStyle(fontWeight: FontWeight.bold)),
          SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Column(
                children: [
                  Icon(Icons.restaurant, color: Colors.green),
                  Text('Eat'),
                  Text('${item.caloriesToConsume} kcal',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Column(
                children: [
                  Icon(Icons.fitness_center, color: Colors.orange),
                  Text('Burn'),
                  Text('${item.caloriesToBurn} kcal',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Column(
                children: [
                  Icon(Icons.trending_down, color: Colors.blue),
                  Text('Net'),
                  Text('${item.netCalories} kcal',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],
          ),
          SizedBox(height: 8),
          Text('Expected: ${item.averageWeeklyWeightChangeKg} kg/week'),
        ],
      ),
    );
  },
)
```

### React Example
```tsx
{schedule.map((item, index) => (
  <div key={index} className="schedule-card">
    <h3>{item.period}</h3>
    <div className="calorie-breakdown">
      <div className="calorie-item consume">
        <span className="icon">🍽️</span>
        <span className="label">Eat</span>
        <span className="value">{item.caloriesToConsume} kcal</span>
      </div>
      <div className="calorie-item burn">
        <span className="icon">🔥</span>
        <span className="label">Burn</span>
        <span className="value">{item.caloriesToBurn} kcal</span>
      </div>
      <div className="calorie-item net">
        <span className="icon">📊</span>
        <span className="label">Net</span>
        <span className="value">{item.netCalories} kcal</span>
      </div>
    </div>
    <p className="weight-change">
      Expected: {item.averageWeeklyWeightChangeKg > 0 ? '+' : ''}
      {item.averageWeeklyWeightChangeKg} kg/week
    </p>
  </div>
))}
```

---

## 💡 User Benefits

### Better Planning
- **Clear nutrition goals**: Know exactly how much to eat
- **Clear exercise goals**: Know how much activity is needed
- **Realistic targets**: Both eating and exercise are sustainable

### More Actionable
- **Food tracking**: User can track against consumption target
- **Exercise tracking**: User can track workouts against burn target
- **Progress monitoring**: See how net calories affect weight change

### Educational
- **Understanding balance**: Users learn how diet + exercise work together
- **Flexible approach**: Can adjust either eating or exercise to hit net target
- **Transparency**: Users see the full calculation (consume - burn = net)

---

## 🎯 AI Guidelines

The AI now follows these rules for calorie recommendations:

### Calories to Consume
- **Minimum**: 1500 kcal/day (women), 1800 kcal/day (men)
- **Maximum**: 3500 kcal/day
- **Adjusts based on**: Current weight, goal, activity level

### Calories to Burn
- **Light exercise**: 200-300 kcal/day (20-30 min walking)
- **Moderate exercise**: 350-450 kcal/day (30-45 min cardio)
- **Intense exercise**: 500-600 kcal/day (45-60 min high intensity)
- **Adjusts based on**: Goal type and user's fitness level

### Net Calories
- **Weight loss**: 300-600 kcal deficit per day
- **Weight gain**: 200-400 kcal surplus per day
- **Maintain**: ±100 kcal of maintenance

---

## ✅ Validation

After restarting server, the AI will return:

```json
{
  "calorie_schedule": [
    {
      "period": "Week 1",
      "calories_to_consume": 2200,
      "calories_to_burn": 400,
      "net_calories": 1800,
      "average_weekly_weight_change_kg": -0.5
    }
  ]
}
```

And it will be stored in the database as:

```javascript
{
  calorieSchedule: [
    {
      period: "Week 1",
      caloriesToConsume: 2200,
      caloriesToBurn: 400,
      netCalories: 1800,
      averageWeeklyWeightChangeKg: -0.5
    }
  ]
}
```

---

## 📄 Files Modified

1. ✅ `src/pages/api/user/makeGoal.ts` - Updated AI prompt and data mapping
2. ✅ `src/models/User.ts` - Updated schema structure
3. ✅ `src/types/index.ts` - Updated TypeScript interface
4. ✅ `AI_GOAL_PLANNER_API.md` - Updated documentation

---

## 🚀 Next Steps

1. **Restart your development server** for schema changes to take effect
2. **Test the API** by creating a new goal
3. **Update frontend** to display the new calorie breakdown
4. **Add tracking features** to log both food intake and exercise

---

**Last Updated**: 2024-10-28  
**Status**: ✅ Complete  
**Breaking Change**: Yes - Field names changed in response

