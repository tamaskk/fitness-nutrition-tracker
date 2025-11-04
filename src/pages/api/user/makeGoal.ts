import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromToken } from '@/utils/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 120000, // 2 minutes for long-duration plans
});

// Increase API route timeout for long AI generation
export const config = {
  maxDuration: 180, // 3 minutes (requires Vercel Pro for >10s)
};

// Helper function to calculate date ranges for periods
function calculatePeriodDates(periodString: string, goalCreatedAt: Date, periodIndex: number) {
  const isWeekly = periodString.toLowerCase().includes('week');
  const startDate = new Date(goalCreatedAt);
  
  if (isWeekly) {
    // For weekly periods: add weeks
    startDate.setDate(startDate.getDate() + (periodIndex * 7));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // 7 days period (inclusive)
    return { startDate, endDate };
  } else {
    // For monthly periods: add months
    startDate.setMonth(startDate.getMonth() + periodIndex);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1); // Last day of the month period
    return { startDate, endDate };
  }
}

const SYSTEM_PROMPT = `
You are a professional fitness and nutrition planner AI.
Your task is to create a realistic, personalized calorie plan and progress roadmap based on user input.

The user will provide:
- Current weight (in kg)
- Goal (lose_weight, gain_weight, maintain_weight)
- Duration (in days or months, can be 2m, 3m, 6m, 1y, 2y, or custom between 60–1825 days)
- Optional: Onboarding questionnaire answers (fitness level, exercise frequency, dietary habits, sleep, stress, health conditions, etc.)

When onboarding answers are provided, use them to personalize the plan:
- Adjust calorie calculations based on their activity level and exercise frequency
- Consider dietary restrictions and eating habits
- Account for sleep quality and stress levels
- Adapt recommendations based on health conditions or limitations
- Tailor the intensity and progression based on their fitness experience
- Provide specific notes addressing their unique challenges and goals

You must calculate:
1. Maintenance calories (roughly 31 × bodyweight in kg for average activity)
2. Target calories depending on goal:
   - Lose weight: 15–25% deficit
   - Gain weight: 10–20% surplus
   - Maintain: same as maintenance
3. For each period, calculate SEPARATELY:
   - Calories to consume (eat from food)
   - Calories to burn (through exercise/activity)
4. Progress milestones (same structure as calorie schedule)
5. Notes: realistic, educational, and motivational.

Rules:
- If duration ≤ 3 months (90 days) → make weekly schedule (max 12-13 periods).
- If duration > 3 months → make monthly schedule (max 12 periods).
- This duration is in the user answers which question is "Mennyi idő alatt szeretnéd ezt elérni?" so look for that and use that as the duration.
- All numeric values must be realistic (no extreme deficits or surpluses).
- Calorie burn should be realistic daily exercise (200-600 kcal/day depending on intensity).
- Output valid JSON only.

CRITICAL - WEIGHT CALCULATION CONSISTENCY (FOLLOW THESE EXACT STEPS):

STEP 1: Determine the weight change per month
- Formula: weight_change_per_month = expected_total_weight_change_kg / number_of_months
- Example: -40 kg / 6 months = -6.67 kg/month

STEP 2: Calculate average_weekly_weight_change_kg and monthly_weight_change_kg
- Formula: average_weekly_weight_change_kg = weight_change_per_month / 4
- Formula: monthly_weight_change_kg = weight_change_per_month (this is the MONTHLY weight change)
- Example: 
  * weight_change_per_month = -6.67 kg/month
  * average_weekly_weight_change_kg = -6.67 / 4 = -1.67 kg/week
  * monthly_weight_change_kg = -6.67 kg/month
- Use the same values for ALL months!

STEP 3: Calculate CUMULATIVE progress milestones
- Use formula: milestone_N = current_weight + (weight_change_per_month × N)
- Example for 6 months, 110 kg → 70 kg (-40 kg):
  * Month 1: 110 + (-6.67 × 1) = 103.33 kg
  * Month 2: 110 + (-6.67 × 2) = 96.66 kg
  * Month 3: 110 + (-6.67 × 3) = 89.99 kg
  * Month 4: 110 + (-6.67 × 4) = 83.32 kg
  * Month 5: 110 + (-6.67 × 5) = 76.65 kg
  * Month 6: 110 + (-6.67 × 6) = 70.00 kg ✓

MANDATORY CHECKS BEFORE OUTPUTTING JSON:
✓ Every month must have the SAME average_weekly_weight_change_kg value!
✓ Last milestone MUST equal target_weight_kg exactly!
✓ Difference between consecutive milestones should be roughly equal (weight_change_per_month)
✓ NO huge jumps in any period - weight loss must be evenly distributed!
✓ Verify: |current_weight - target_weight_kg| = |expected_total_weight_change_kg|

WRONG EXAMPLE (DO NOT DO THIS):
- Month 5: 103.33 kg, Month 6: 70 kg = -33.33 kg in one month ❌ DANGEROUS!

CORRECT EXAMPLE for 40 kg over 12 months:
- weight_change_per_month: -40 / 12 = -3.33 kg/month
- average_weekly_weight_change_kg: -3.33 / 4 = -0.83 kg/week
- All 12 months have -0.83 kg/week
- Month 1: 106.67, Month 2: 103.34, ..., Month 12: 70.00 kg ✓

JSON FORMAT:

{
  "user": {
    "weight_kg": number,
    "goal": "lose_weight" | "gain_weight" | "maintain_weight",
    "duration_days": number,
    "duration_type": string
  },
  "plan": {
    "maintenance_calories": number,
    "goal_calories_start": number,
    "goal_calories_end": number,
    "average_daily_deficit_or_surplus_kcal": number,
    "expected_total_weight_change_kg": number,
    "target_weight_kg": number,
    "calorie_schedule": [
      {
        "period": "Week 1" | "Month 1" ...,
        "calories_to_consume": number,
        "calories_to_burn": number,
        "net_calories": number,
        "average_weekly_weight_change_kg": number,
        "monthly_weight_change_kg": number (for monthly schedules, this is the weight change for THIS month, equals average_weekly_weight_change_kg × 4)
      }
    ],
    "progress_milestones": [
      {
        "period": "Week 1" | "Month 1" ...,
        "target_weight_kg": number
      }
    ],
    "notes": [
      "text of helpful or motivational note"
    ]
  }
}

Be sure to calculate everything realistically, e.g.:
- For weight loss: 0.4–1.0 kg/week (adjust based on total duration and goal)
- For weight gain: 0.2–0.4 kg/week
- Calories to consume: typically 1500-3000 kcal/day depending on goal and weight
- Calories to burn: typically 200-600 kcal/day from exercise (30-60 min activity)
- Net calories = calories_to_consume - calories_to_burn
- Include 8–12 total notes covering both nutrition and exercise.

WEIGHT CHANGE CALCULATION - USE THESE EXACT FORMULAS:

1. weight_change_per_month = expected_total_weight_change_kg / number_of_months
2. average_weekly_weight_change_kg = weight_change_per_month / 4
3. milestone_N = current_weight + (weight_change_per_month × N)
4. Verify: milestone_last = target_weight_kg

Example A: -40 kg over 6 months (starting 110 kg):
- weight_change_per_month = -40 / 6 = -6.67 kg/month
- average_weekly_weight_change_kg = -6.67 / 4 = -1.67 kg/week
- monthly_weight_change_kg = -6.67 kg/month
- All 6 months use: -1.67 kg/week AND -6.67 kg/month (same values for all!)
- Milestones:
  * Month 1: 110 + (-6.67 × 1) = 103.33 kg
  * Month 2: 110 + (-6.67 × 2) = 96.66 kg
  * Month 3: 110 + (-6.67 × 3) = 89.99 kg
  * Month 4: 110 + (-6.67 × 4) = 83.32 kg
  * Month 5: 110 + (-6.67 × 5) = 76.65 kg
  * Month 6: 110 + (-6.67 × 6) = 70.00 kg ✓ (equals target_weight_kg)

Example B: -40 kg over 12 months (starting 110 kg):
- weight_change_per_month = -40 / 12 = -3.33 kg/month
- average_weekly_weight_change_kg = -3.33 / 4 = -0.83 kg/week
- monthly_weight_change_kg = -3.33 kg/month
- All 12 months use: -0.83 kg/week AND -3.33 kg/month (same values for all!)
- Milestones:
  * Month 1: 110 + (-3.33 × 1) = 106.67 kg
  * Month 6: 110 + (-3.33 × 6) = 90.00 kg
  * Month 12: 110 + (-3.33 × 12) = 70.00 kg ✓ (equals target_weight_kg)

Output **only valid JSON** — no explanations or formatting outside the JSON.
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for JWT token first (for mobile app), then NextAuth session (for web app)
  const tokenUser = getUserFromToken(req);
  const session = await getServerSession(req, res, authOptions);
  
  const userEmail = tokenUser?.email || session?.user?.email || req.body.userEmail;
  
  if (!userEmail) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user's current weight
      const currentWeight = user.weight?.value;
      if (!currentWeight) {
        return res.status(400).json({ message: 'User weight is required. Please update your profile first.' });
      }


      // Build onboarding context from user answers
      let onboardingContext = '';
      if (user.onboardingAnswers && Array.isArray(user.onboardingAnswers) && user.onboardingAnswers.length > 0) {
        onboardingContext = '\n\nUser Background & Preferences (from onboarding questionnaire):\n';
        user.onboardingAnswers.forEach((qa: any) => {
          onboardingContext += `- ${qa.question}: ${qa.answer}\n`;
        });
        onboardingContext += '\nPlease consider these answers when creating the personalized fitness plan.';
      }

      // Generate AI plan using OpenAI
      let aiGeneratedPlan;
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.7,
          max_tokens: 4000, // Limit response size for very long durations
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `User input: 
              weight: ${currentWeight} kg,
              Use the following context to create a personalized plan: ${onboardingContext}`
            },
          ],
        });

        const result = completion.choices[0].message?.content;
        if (!result) {
          throw new Error('No response from OpenAI');
        }

        const parsedResult = JSON.parse(result);
        aiGeneratedPlan = parsedResult.plan;
        
        console.log('AI plan generated successfully');
      } catch (aiError) {
        console.error('OpenAI error:', aiError);
        
        // Check if it's a timeout error
        const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown error';
        const isTimeout = errorMessage.includes('timed out') || errorMessage.includes('timeout');
        
        if (isTimeout) {
          return res.status(504).json({ 
            message: 'AI plan generation timed out. Please try with a shorter duration or try again later.', 
            error: errorMessage,
            suggestion: 'For very long durations (>1 year), the AI needs more time to generate a comprehensive plan.'
          });
        }
        
        return res.status(500).json({ 
          message: 'Failed to generate AI plan', 
          error: errorMessage
        });
      }

      // Save goal with AI-generated plan
      const goalCreatedAt = new Date();
      
      user.goal = {
        plan: {
          maintenanceCalories: aiGeneratedPlan.maintenance_calories,
          goalCaloriesStart: aiGeneratedPlan.goal_calories_start,
          goalCaloriesEnd: aiGeneratedPlan.goal_calories_end,
          averageDailyDeficitOrSurplusKcal: aiGeneratedPlan.average_daily_deficit_or_surplus_kcal,
          expectedTotalWeightChangeKg: aiGeneratedPlan.expected_total_weight_change_kg,
          targetWeightKg: aiGeneratedPlan.target_weight_kg,
          calorieSchedule: aiGeneratedPlan.calorie_schedule?.map((item: any, index: number) => {
            const { startDate, endDate } = calculatePeriodDates(item.period, goalCreatedAt, index);
            return {
              period: item.period,
              caloriesToConsume: item.calories_to_consume,
              caloriesToBurn: item.calories_to_burn,
              netCalories: item.net_calories,
              averageWeeklyWeightChangeKg: item.average_weekly_weight_change_kg,
              monthlyWeightChangeKg: item.monthly_weight_change_kg,
              startDate,
              endDate,
            };
          }) || [],
          progressMilestones: aiGeneratedPlan.progress_milestones?.map((item: any, index: number) => {
            const { startDate, endDate } = calculatePeriodDates(item.period, goalCreatedAt, index);
            return {
              period: item.period,
              targetWeightKg: item.target_weight_kg,
              startDate,
              endDate,
            };
          }) || [],
          notes: aiGeneratedPlan.notes || [],
        },
        createdAt: goalCreatedAt,
      };
      
      await user.save();

      console.log('Goal and plan saved successfully');

      res.status(200).json({ 
        message: 'Goal set successfully',
        goal: user.goal,
      });
    } else if (req.method === 'GET') {
      // Get user's current goal and plan
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.goal || !user.goal.plan) {
        return res.status(404).json({ message: 'No goal set yet. Please create a goal first.' });
      }

      res.status(200).json({ 
        goal: user.goal,
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}