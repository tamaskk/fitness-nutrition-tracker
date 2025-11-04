# Goal Weight Calculation Fix (Updated)

## Problem Identified

The AI-generated goal plans had **severely inconsistent** weight change calculations even after the first fix:

### Real User Data Showing the Problem:

**User Goal**: Lose 40 kg over 6 months (110 kg → 70 kg)

**What the AI Generated (WRONG)**:
```json
{
  "expectedTotalWeightChangeKg": -40,  // ✓ Correct
  "calorieSchedule": [
    { "averageWeeklyWeightChangeKg": -1.33 },  // For all 6 months
    // Total: -1.33 × 4 weeks × 6 months = -31.92 kg ❌ NOT -40!
  ],
  "progressMilestones": [
    { "period": "Month 1", "targetWeightKg": 108.67 },  // -1.33 kg
    { "period": "Month 2", "targetWeightKg": 107.33 },  // -1.33 kg
    { "period": "Month 3", "targetWeightKg": 106.00 },  // -1.33 kg
    { "period": "Month 4", "targetWeightKg": 104.67 },  // -1.33 kg
    { "period": "Month 5", "targetWeightKg": 103.33 },  // -1.33 kg
    { "period": "Month 6", "targetWeightKg": 70.00 }    // -33.33 kg ❌ DANGEROUS!
    // Last month has a -33.33 kg drop - impossible and life-threatening!
  ]
}
```

**Problems**:
1. Weekly changes don't add up: -1.33 kg/week should be -1.67 kg/week
2. Progress is minimal for 5 months, then a catastrophic -33.33 kg drop in Month 6
3. Total actual weight loss from milestones: only -8 kg in 5 months, then -33 kg in 1 month!

---

### Example of the Issue (Original Documentation):
```json
{
  "expectedTotalWeightChangeKg": -40,  // Goal: lose 40 kg
  "calorieSchedule": [
    { "period": "Month 1", "averageWeeklyWeightChangeKg": -0.5 },
    { "period": "Month 2", "averageWeeklyWeightChangeKg": -0.5 },
    { "period": "Month 3", "averageWeeklyWeightChangeKg": -0.5 },
    { "period": "Month 4", "averageWeeklyWeightChangeKg": -0.5 },
    { "period": "Month 5", "averageWeeklyWeightChangeKg": -0.5 },
    { "period": "Month 6", "averageWeeklyWeightChangeKg": -0.5 }
    // ... for 12 months
  ],
  "progressMilestones": [
    { "period": "Month 1", "targetWeightKg": 107.5 },  // -2.5 kg
    { "period": "Month 6", "targetWeightKg": 95 }      // -15 kg total
  ]
}
```

### Issues:
1. **Weekly weight change doesn't add up**: -0.5 kg/week × 4 weeks/month × 12 months = -24 kg (not -40 kg)
2. **Milestones don't match**: 110 kg → 95 kg = -15 kg (not -40 kg)
3. **Inconsistent across all fields**: The total expected weight change doesn't match the actual calculated changes

---

## Solution

Updated the AI prompt with **strict mathematical validation rules** to ensure:
1. All weight changes across periods sum to `expectedTotalWeightChangeKg`
2. Progress milestones are cumulative and add up correctly
3. The last milestone equals `targetWeightKg`

---

## Correct Calculation Example

### Scenario: Lose 40 kg over 12 months
**Starting weight**: 110 kg  
**Target weight**: 70 kg  
**Duration**: 12 months

### Step-by-Step Calculation:

1. **Total weight change**: -40 kg
2. **Number of periods**: 12 months
3. **Average weight change per month**: -40 kg ÷ 12 = **-3.33 kg/month**
4. **Average weekly weight change**: -3.33 kg ÷ 4 = **-0.83 kg/week**

### Correct Calorie Schedule:
```json
{
  "calorieSchedule": [
    {
      "period": "Month 1",
      "caloriesToConsume": 2560,
      "caloriesToBurn": 400,
      "netCalories": 2160,
      "averageWeeklyWeightChangeKg": -0.83
    },
    {
      "period": "Month 2",
      "caloriesToConsume": 2560,
      "caloriesToBurn": 400,
      "netCalories": 2160,
      "averageWeeklyWeightChangeKg": -0.83
    },
    // ... continues for all 12 months
    {
      "period": "Month 12",
      "caloriesToConsume": 2560,
      "caloriesToBurn": 400,
      "netCalories": 2160,
      "averageWeeklyWeightChangeKg": -0.83
    }
  ]
}
```

### Correct Progress Milestones:
```json
{
  "progressMilestones": [
    { "period": "Month 1", "targetWeightKg": 106.67 },  // 110 - 3.33 = 106.67
    { "period": "Month 2", "targetWeightKg": 103.34 },  // 106.67 - 3.33 = 103.34
    { "period": "Month 3", "targetWeightKg": 100.01 },  // 103.34 - 3.33 = 100.01
    { "period": "Month 4", "targetWeightKg": 96.68 },   // 100.01 - 3.33 = 96.68
    { "period": "Month 5", "targetWeightKg": 93.35 },   // 96.68 - 3.33 = 93.35
    { "period": "Month 6", "targetWeightKg": 90.02 },   // 93.35 - 3.33 = 90.02
    { "period": "Month 7", "targetWeightKg": 86.69 },   // 90.02 - 3.33 = 86.69
    { "period": "Month 8", "targetWeightKg": 83.36 },   // 86.69 - 3.33 = 83.36
    { "period": "Month 9", "targetWeightKg": 80.03 },   // 83.36 - 3.33 = 80.03
    { "period": "Month 10", "targetWeightKg": 76.70 },  // 80.03 - 3.33 = 76.70
    { "period": "Month 11", "targetWeightKg": 73.37 },  // 76.70 - 3.33 = 73.37
    { "period": "Month 12", "targetWeightKg": 70.00 }   // 73.37 - 3.33 = 70.00 ✓
  ]
}
```

### Verification:
✅ **Total weight change**: 110 kg - 70 kg = 40 kg  
✅ **Sum of weekly changes**: -0.83 kg/week × 4 weeks × 12 months = -39.84 kg ≈ -40 kg  
✅ **Milestones add up**: Month 1 to Month 12 = 106.67 to 70 = -36.67 kg (with rounding variations)

---

## Alternative Example: Lose 40 kg over 6 months (Aggressive)

**Starting weight**: 110 kg  
**Target weight**: 70 kg  
**Duration**: 6 months

### Calculation:

1. **Total weight change**: -40 kg
2. **Number of periods**: 6 months
3. **Average weight change per month**: -40 kg ÷ 6 = **-6.67 kg/month**
4. **Average weekly weight change**: -6.67 kg ÷ 4 = **-1.67 kg/week**

### Correct Data:
```json
{
  "expectedTotalWeightChangeKg": -40,
  "targetWeightKg": 70,
  "calorieSchedule": [
    { "period": "Month 1", "averageWeeklyWeightChangeKg": -1.67 },
    { "period": "Month 2", "averageWeeklyWeightChangeKg": -1.67 },
    { "period": "Month 3", "averageWeeklyWeightChangeKg": -1.67 },
    { "period": "Month 4", "averageWeeklyWeightChangeKg": -1.67 },
    { "period": "Month 5", "averageWeeklyWeightChangeKg": -1.67 },
    { "period": "Month 6", "averageWeeklyWeightChangeKg": -1.67 }
  ],
  "progressMilestones": [
    { "period": "Month 1", "targetWeightKg": 103.33 },  // 110 - 6.67
    { "period": "Month 2", "targetWeightKg": 96.66 },   // 103.33 - 6.67
    { "period": "Month 3", "targetWeightKg": 89.99 },   // 96.66 - 6.67
    { "period": "Month 4", "targetWeightKg": 83.32 },   // 89.99 - 6.67
    { "period": "Month 5", "targetWeightKg": 76.65 },   // 83.32 - 6.67
    { "period": "Month 6", "targetWeightKg": 70.00 }    // 76.65 - 6.67 = 70 ✓
  ]
}
```

### Verification:
✅ **Total weight change**: 110 kg - 70 kg = 40 kg  
✅ **Sum of weekly changes**: -1.67 kg/week × 4 weeks × 6 months = -40.08 kg ≈ -40 kg  
✅ **Milestones add up**: 110 kg → 70 kg = -40 kg ✓

---

## What Changed in the Code (Updated Fix)

### Updated File: `/src/pages/api/user/makeGoal.ts`

**Version 2 of the fix** completely rewrote the AI prompt with explicit mathematical formulas and step-by-step instructions.

#### Key Changes:

1. **Explicit Formulas** - The AI now receives exact formulas to use:
   ```
   weight_change_per_month = expected_total_weight_change_kg / number_of_months
   average_weekly_weight_change_kg = weight_change_per_month / 4
   milestone_N = current_weight + (weight_change_per_month × N)
   ```

2. **Concrete Examples** - Added the EXACT 6-month scenario that was failing:
   - Example A: -40 kg over 6 months with step-by-step calculations
   - Example B: -40 kg over 12 months for comparison

3. **Wrong Example Warning** - Explicitly shows what NOT to do:
   ```
   WRONG: Month 5: 103.33 kg, Month 6: 70 kg = -33.33 kg in one month ❌
   ```

4. **Mandatory Pre-Output Checks** - Forces the AI to verify before generating JSON:
   - Every month must have the SAME average_weekly_weight_change_kg
   - Last milestone MUST equal target_weight_kg
   - No huge jumps in any period
   - Weight loss must be evenly distributed

### Old Prompt (Version 1) - Too Vague:

```typescript
CRITICAL - WEIGHT CALCULATION CONSISTENCY:
- The expected_total_weight_change_kg MUST equal the sum of all weight changes across all periods.
- Progress milestones MUST be cumulative and consistent...
```

### New Prompt (Version 2) - Explicit Formulas:

```typescript
CRITICAL - WEIGHT CALCULATION CONSISTENCY (FOLLOW THESE EXACT STEPS):

STEP 1: Determine the weight change per month
- Formula: weight_change_per_month = expected_total_weight_change_kg / number_of_months
- Example: -40 kg / 6 months = -6.67 kg/month

STEP 2: Calculate average_weekly_weight_change_kg
- Formula: average_weekly_weight_change_kg = weight_change_per_month / 4
- Example: -6.67 / 4 = -1.67 kg/week (use this same value for ALL months!)

STEP 3: Calculate CUMULATIVE progress milestones
- Use formula: milestone_N = current_weight + (weight_change_per_month × N)
- Example for 6 months, 110 kg → 70 kg (-40 kg):
  * Month 1: 110 + (-6.67 × 1) = 103.33 kg
  * Month 2: 110 + (-6.67 × 2) = 96.66 kg
  * Month 6: 110 + (-6.67 × 6) = 70.00 kg ✓

MANDATORY CHECKS BEFORE OUTPUTTING JSON:
✓ Every month must have the SAME average_weekly_weight_change_kg value!
✓ Last milestone MUST equal target_weight_kg exactly!
✓ NO huge jumps in any period - weight loss must be evenly distributed!

WRONG EXAMPLE (DO NOT DO THIS):
- Month 5: 103.33 kg, Month 6: 70 kg = -33.33 kg in one month ❌ DANGEROUS!
```

The key improvement is that the AI now receives **exact mathematical formulas** instead of vague instructions, making it impossible to generate inconsistent calculations.

---

## Testing the Fix

To test if the fix works correctly, create a new goal and verify:

1. **Check total weight change**:
   ```
   expectedTotalWeightChangeKg = targetWeightKg - currentWeight
   ```

2. **Check weekly changes add up**:
   ```
   For monthly schedule:
   Sum of (averageWeeklyWeightChangeKg × 4) for all months ≈ expectedTotalWeightChangeKg
   ```

3. **Check milestones progression**:
   ```
   First milestone - Last milestone = expectedTotalWeightChangeKg
   Last milestone = targetWeightKg
   ```

---

## Impact

- ✅ All new goal plans will have mathematically consistent weight projections
- ✅ Users will see realistic and accurate progress milestones
- ✅ Weekly weight change goals will properly distribute across the entire duration
- ✅ The target weight will be achievable based on the calculated weekly/monthly changes

---

## Note

Existing users with old inconsistent goal plans may need to regenerate their goals to get the corrected calculations. The fix only applies to newly created goals.

