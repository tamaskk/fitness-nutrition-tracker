# Smart Questions - Quick Reference

## What It Does

When users request a training plan without enough details, the bot **asks follow-up questions** instead of immediately returning "training".

---

## Flow

```
"Create workout" → Missing details? → Ask questions
                                    ↓
User provides details → Has 3+ details? → Return "training"
```

---

## Required Details (Need 3+)

1. Target muscle groups
2. Exercises per muscle
3. Training frequency (days/week)
4. Fitness level
5. Equipment available
6. Workout duration

---

## Response Types

### Need More Info
```json
{
  "category": "general",
  "needsMoreInfo": true,
  "pendingCategory": "training",
  "response": "I need a few details: ..."
}
```
→ **Display questions, don't redirect**

### Has Enough Info
```json
{
  "category": "training",
  "response": "training"
}
```
→ **Redirect to training section**

---

## Examples

| User Says | Has Details? | What Happens |
|-----------|--------------|--------------|
| "Create workout" | ❌ | Asks questions |
| "3-day chest plan, intermediate, gym" | ✅ | Returns "training" |
| "Full body workout for beginner" | ❌ | Asks for frequency, exercises |
| "5-day split, 4 exercises per muscle, home gym" | ✅ | Returns "training" |

---

## Frontend Handling

```typescript
if (data.needsMoreInfo) {
  // Show questions in chat
  displayInChat(data.response);
  showBadge(`Creating ${data.pendingCategory} plan...`);
}
else if (data.category === 'training') {
  // Redirect to training
  router.push('/training');
}
```

---

## New Fields

| Field | Meaning |
|-------|---------|
| `needsMoreInfo` | true = need more details |
| `pendingCategory` | What it will be once complete |

---

For full docs: `TRAINING_PLAN_SMART_QUESTIONS.md`

