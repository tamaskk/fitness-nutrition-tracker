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

const SYSTEM_PROMPT = `
You are a professional fitness and nutrition planner AI.
Your task is to create a realistic calorie plan and progress roadmap based on user input.

The user will provide:
- Current weight (in kg)
- Goal (lose_weight, gain_weight, maintain_weight)
- Duration (in days or months, can be 2m, 3m, 6m, 1y, 2y, or custom between 60–1825 days)

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
- If duration > 3 months and ≤ 1 year (365 days) → make monthly schedule (max 12 periods).
- If duration > 1 year (365 days) → make quarterly schedule (every 3 months, max 8 periods).
- For very long durations, focus on quarterly milestones to keep response concise.
- All numeric values must be realistic (no extreme deficits or surpluses).
- Calorie burn should be realistic daily exercise (200-600 kcal/day depending on intensity).
- Output valid JSON only.

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
        "period": "Week 1" | "Month 1" | "Quarter 1" | ...,
        "calories_to_consume": number,
        "calories_to_burn": number,
        "net_calories": number,
        "average_weekly_weight_change_kg": number
      }
    ],
    "progress_milestones": [
      {
        "period": "Week 1" | "Month 1" | "Quarter 1" | ...,
        "target_weight_kg": number
      }
    ],
    "notes": [
      "text of helpful or motivational note"
    ]
  }
}

Be sure to calculate everything realistically, e.g.:
- For weight loss: 0.4–0.7 kg/week
- For weight gain: 0.2–0.4 kg/week
- Calories to consume: typically 1500-3000 kcal/day depending on goal and weight
- Calories to burn: typically 200-600 kcal/day from exercise (30-60 min activity)
- Net calories = calories_to_consume - calories_to_burn
- Include 8–12 total notes covering both nutrition and exercise.

Output **only valid JSON** — no explanations or formatting outside the JSON.
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for JWT token first (for mobile app), then NextAuth session (for web app)
  const tokenUser = getUserFromToken(req);
  const session = await getServerSession(req, res, authOptions);
  
  const userEmail = tokenUser?.email || session?.user?.email;
  
  if (!userEmail) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { goalType, targetWeight, durationDays } = req.body as {
        goalType: 'lose_weight' | 'gain_weight' | 'build_muscle' | 'maintain_weight' | 'improve_fitness' | 'tone_body';
        targetWeight: number;
        durationDays: number;
      };

      if (!goalType || !targetWeight || !durationDays) {
        return res.status(400).json({ message: 'goalType, targetWeight, and durationDays are required' });
      }
      
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user's current weight
      const currentWeight = user.weight?.value;
      if (!currentWeight) {
        return res.status(400).json({ message: 'User weight is required. Please update your profile first.' });
      }

      console.log('Generating AI plan for:', { currentWeight, goalType, durationDays });

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
              goal: ${goalType},
              duration: ${durationDays} days
              
              Note: ${durationDays > 365 ? 'Use QUARTERLY schedule (Quarter 1, Quarter 2, etc.) since duration is over 1 year.' : durationDays > 90 ? 'Use MONTHLY schedule.' : 'Use WEEKLY schedule.'}`
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
      user.goal = {
        goalType,
        targetWeight,
        durationDays,
        plan: {
          maintenanceCalories: aiGeneratedPlan.maintenance_calories,
          goalCaloriesStart: aiGeneratedPlan.goal_calories_start,
          goalCaloriesEnd: aiGeneratedPlan.goal_calories_end,
          averageDailyDeficitOrSurplusKcal: aiGeneratedPlan.average_daily_deficit_or_surplus_kcal,
          expectedTotalWeightChangeKg: aiGeneratedPlan.expected_total_weight_change_kg,
          targetWeightKg: aiGeneratedPlan.target_weight_kg,
          calorieSchedule: aiGeneratedPlan.calorie_schedule?.map((item: any) => ({
            period: item.period,
            caloriesToConsume: item.calories_to_consume,
            caloriesToBurn: item.calories_to_burn,
            netCalories: item.net_calories,
            averageWeeklyWeightChangeKg: item.average_weekly_weight_change_kg,
          })) || [],
          progressMilestones: aiGeneratedPlan.progress_milestones?.map((item: any) => ({
            period: item.period,
            targetWeightKg: item.target_weight_kg,
          })) || [],
          notes: aiGeneratedPlan.notes || [],
        },
        createdAt: new Date(),
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