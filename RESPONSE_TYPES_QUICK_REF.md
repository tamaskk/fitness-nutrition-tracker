# Response Types - Quick Reference

## Flow

```
User: "Create workout"
    ↓
responseType: "muscleGroup" → Show muscle buttons
    ↓
User: Selects muscles
    ↓
responseType: "exerciseNumber" → Show number buttons
    ↓
User: Selects count
    ↓
category: "training" → Redirect to /training
```

---

## Response Types

| Type | Frontend Action |
|------|-----------------|
| `muscleGroup` | Display muscle group selection buttons |
| `exerciseNumber` | Display exercise count buttons (2-6) |
| None (category: "training") | Redirect to training section |

---

## Step 1: Muscle Group

**API Response:**
```json
{
  "responseType": "muscleGroup",
  "response": "Which muscle groups do you want to focus on?",
  ...
}
```

**Frontend:**
```tsx
<MuscleGroupButtons 
  options={['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Full Body']}
  onSelect={(selected) => {
    sendMessage(`I want to train: ${selected.join(', ')}`);
  }}
/>
```

---

## Step 2: Exercise Number

**API Response:**
```json
{
  "responseType": "exerciseNumber",
  "response": "How many exercises per muscle group?",
  ...
}
```

**Frontend:**
```tsx
<ExerciseCountButtons 
  options={[2, 3, 4, 5, 6]}
  onSelect={(count) => {
    sendMessage(`${count} exercises per muscle group`);
  }}
/>
```

---

## Step 3: Complete

**API Response:**
```json
{
  "category": "training",
  "response": "training"
}
```

**Frontend:**
```tsx
router.push('/training', {
  state: { conversationHistory }
});
```

---

## Simple Handler

```typescript
if (data.responseType === 'muscleGroup') {
  showMuscleButtons();
}
else if (data.responseType === 'exerciseNumber') {
  showExerciseButtons();
}
else if (data.category === 'training') {
  redirectToTraining();
}
```

---

## Muscle Group Options

```typescript
['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Full Body']
```

**Hungarian:**
```typescript
['Mellkas', 'Hát', 'Láb', 'Váll', 'Kar', 'Has', 'Teljes test']
```

---

## Exercise Count Options

```typescript
[2, 3, 4, 5, 6]
```

**With labels:**
```typescript
[
  { value: 2, label: '2 exercises' },
  { value: 3, label: '3 exercises' },
  { value: 4, label: '4 exercises' },
  { value: 5, label: '5 exercises' },
  { value: 6, label: '6 exercises' }
]
```

---

## Response Fields

```json
{
  "success": true,
  "category": "general",
  "responseType": "muscleGroup | exerciseNumber",
  "needsMoreInfo": true,
  "pendingCategory": "training",
  "response": "Question text...",
  "conversationHistory": [...],
  "timestamp": "...",
  "messageCount": 2
}
```

---

For detailed documentation: `TRAINING_PLAN_STRUCTURED_FLOW.md`

