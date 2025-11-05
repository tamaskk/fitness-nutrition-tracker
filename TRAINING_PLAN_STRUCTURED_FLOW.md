# Training Plan Structured Flow with Response Types

## Overview

The chatbot now uses a **structured step-by-step flow** when users request a training plan. Instead of asking all questions at once, it asks for specific information one at a time with **interactive response types** for the frontend to display as buttons.

---

## Structured Flow

```
User: "Create workout"
    ↓
Step 1: Ask for MUSCLE GROUPS (responseType: "muscleGroup")
    ↓
User: Selects muscle groups via buttons
    ↓
Step 2: Ask for EXERCISE NUMBER (responseType: "exerciseNumber")
    ↓
User: Selects exercise count via buttons
    ↓
Step 3: Return "training" (has all info)
    ↓
Frontend: Redirect to training section
```

---

## Response Types

The API returns a `responseType` field to tell the frontend what UI to display:

| Response Type | When | Frontend Action |
|---------------|------|-----------------|
| `muscleGroup` | Needs muscle group selection | Display muscle group buttons |
| `exerciseNumber` | Needs exercise count | Display number selection buttons |
| `training` | Has all info | Redirect to training section |

---

## Step 1: Muscle Group Selection

### API Response

```json
{
  "success": true,
  "category": "general",
  "responseType": "muscleGroup",
  "needsMoreInfo": true,
  "pendingCategory": "training",
  "response": "Which muscle groups do you want to focus on? Select one or more:",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create a workout plan",
      "timestamp": "2025-11-03T15:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "muscleGroup",
      "timestamp": "2025-11-03T15:00:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T15:00:00.000Z",
  "messageCount": 2
}
```

### Frontend Implementation

```typescript
if (data.responseType === 'muscleGroup') {
  // Display muscle group selection buttons
  const muscleGroups = [
    { id: 'chest', label: 'Chest', icon: '💪' },
    { id: 'back', label: 'Back', icon: '🏋️' },
    { id: 'legs', label: 'Legs', icon: '🦵' },
    { id: 'shoulders', label: 'Shoulders', icon: '💪' },
    { id: 'arms', label: 'Arms', icon: '💪' },
    { id: 'abs', label: 'Abs', icon: '🎯' },
    { id: 'full-body', label: 'Full Body', icon: '🔥' }
  ];
  
  showMuscleGroupButtons(muscleGroups);
}
```

### User Selection (Multiple Choice)

```typescript
const selectedMuscles = ['chest', 'back', 'shoulders'];
const userMessage = `I want to train: ${selectedMuscles.join(', ')}`;

// Send back to API
await sendMessage(userMessage);
```

---

## Step 2: Exercise Number Selection

### API Response

```json
{
  "success": true,
  "category": "general",
  "responseType": "exerciseNumber",
  "needsMoreInfo": true,
  "pendingCategory": "training",
  "response": "How many exercises per muscle group would you like?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create a workout plan",
      "timestamp": "2025-11-03T15:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "muscleGroup",
      "timestamp": "2025-11-03T15:00:00.000Z"
    },
    {
      "role": "user",
      "content": "I want to train: chest, back, shoulders",
      "timestamp": "2025-11-03T15:01:00.000Z"
    },
    {
      "role": "assistant",
      "content": "exerciseNumber",
      "timestamp": "2025-11-03T15:01:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T15:01:00.000Z",
  "messageCount": 4
}
```

### Frontend Implementation

```typescript
if (data.responseType === 'exerciseNumber') {
  // Display exercise number selection buttons
  const exerciseCounts = [
    { value: 3, label: '3 exercises' },
    { value: 4, label: '4 exercises' },
    { value: 5, label: '5 exercises' },
    { value: 6, label: '6 exercises' }
  ];
  
  showExerciseNumberButtons(exerciseCounts);
}
```

### User Selection (Single Choice)

```typescript
const selectedCount = 4;
const userMessage = `${selectedCount} exercises per muscle group`;

// Send back to API
await sendMessage(userMessage);
```

---

## Step 3: Complete - Return Training

### API Response

```json
{
  "success": true,
  "category": "training",
  "response": "training",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create a workout plan",
      "timestamp": "2025-11-03T15:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "muscleGroup",
      "timestamp": "2025-11-03T15:00:00.000Z"
    },
    {
      "role": "user",
      "content": "I want to train: chest, back, shoulders",
      "timestamp": "2025-11-03T15:01:00.000Z"
    },
    {
      "role": "assistant",
      "content": "exerciseNumber",
      "timestamp": "2025-11-03T15:01:00.000Z"
    },
    {
      "role": "user",
      "content": "4 exercises per muscle group",
      "timestamp": "2025-11-03T15:02:00.000Z"
    },
    {
      "role": "assistant",
      "content": "training",
      "timestamp": "2025-11-03T15:02:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T15:02:00.000Z",
  "messageCount": 6
}
```

### Frontend Action

```typescript
if (data.category === 'training') {
  // Has all required information - redirect to training section
  router.push('/training', {
    state: {
      conversationHistory: data.conversationHistory,
      // Extract details from conversation
      muscleGroups: extractMuscleGroups(data.conversationHistory),
      exercisesPerMuscle: extractExerciseNumber(data.conversationHistory)
    }
  });
}
```

---

## Complete Frontend Example

```typescript
const handleChatResponse = async (data: any) => {
  // Store conversation history
  setConversationHistory(data.conversationHistory);
  
  // Handle different response types
  switch (data.responseType) {
    case 'muscleGroup':
      // Show muscle group selection UI
      setUIMode('muscleGroupSelection');
      showMuscleGroupButtons();
      break;
      
    case 'exerciseNumber':
      // Show exercise number selection UI
      setUIMode('exerciseNumberSelection');
      showExerciseCountButtons();
      break;
      
    default:
      // Check if we should redirect
      if (data.category === 'training') {
        // All info collected - redirect to training
        router.push('/training', {
          state: { conversationHistory: data.conversationHistory }
        });
      } else if (data.category === 'general') {
        // Regular chat response
        displayChatMessage(data.response);
      }
  }
};

// When user selects muscle groups
const onMuscleGroupsSelected = async (selected: string[]) => {
  const message = `I want to train: ${selected.join(', ')}`;
  const response = await sendMessage(message);
  await handleChatResponse(response);
};

// When user selects exercise count
const onExerciseNumberSelected = async (count: number) => {
  const message = `${count} exercises per muscle group`;
  const response = await sendMessage(message);
  await handleChatResponse(response);
};
```

---

## React Component Example

```tsx
import { useState } from 'react';

const TrainingChatbot = () => {
  const [uiMode, setUIMode] = useState<'chat' | 'muscleGroup' | 'exerciseNumber'>('chat');
  const [conversationHistory, setConversationHistory] = useState([]);

  const sendMessage = async (message: string) => {
    const res = await fetch('/api/fitness/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory })
    });
    return res.json();
  };

  const handleResponse = async (data: any) => {
    setConversationHistory(data.conversationHistory);

    if (data.responseType === 'muscleGroup') {
      setUIMode('muscleGroup');
    } else if (data.responseType === 'exerciseNumber') {
      setUIMode('exerciseNumber');
    } else if (data.category === 'training') {
      router.push('/training', { state: data.conversationHistory });
    }
  };

  const muscleGroups = [
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'legs', label: 'Legs' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'arms', label: 'Arms' },
    { id: 'abs', label: 'Abs' },
    { id: 'full-body', label: 'Full Body' }
  ];

  return (
    <div>
      {uiMode === 'muscleGroup' && (
        <MuscleGroupSelector
          groups={muscleGroups}
          onSelect={async (selected) => {
            const msg = `I want to train: ${selected.join(', ')}`;
            const data = await sendMessage(msg);
            handleResponse(data);
          }}
        />
      )}

      {uiMode === 'exerciseNumber' && (
        <ExerciseNumberSelector
          options={[3, 4, 5, 6]}
          onSelect={async (count) => {
            const msg = `${count} exercises per muscle group`;
            const data = await sendMessage(msg);
            handleResponse(data);
          }}
        />
      )}

      {uiMode === 'chat' && (
        <ChatInterface onSendMessage={async (msg) => {
          const data = await sendMessage(msg);
          handleResponse(data);
        }} />
      )}
    </div>
  );
};
```

---

## Response Fields Reference

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Request success status |
| `category` | string | Message category: "general", "training", etc. |
| `responseType` | string | UI type to display: "muscleGroup", "exerciseNumber" |
| `needsMoreInfo` | boolean | True if more info needed before proceeding |
| `pendingCategory` | string | Category pending completion (e.g., "training") |
| `response` | string | Text to display to user |
| `conversationHistory` | array | Full conversation history |
| `timestamp` | string | ISO 8601 timestamp |
| `messageCount` | number | Total messages in conversation |

---

## Supported Languages

The system detects muscle groups and exercise numbers in multiple languages:

### English
- chest, back, legs, shoulders, arms, abs
- "3 exercises", "4 per muscle"

### Hungarian  
- mellkas, hát, láb, váll, kar, has
- "3 gyakorlat", "4 gyakorlat izmonként"

---

## Button Options for Frontend

### Muscle Groups
```typescript
const muscleGroupOptions = [
  { id: 'chest', label: 'Chest', labelHU: 'Mellkas', icon: '💪' },
  { id: 'back', label: 'Back', labelHU: 'Hát', icon: '🏋️' },
  { id: 'legs', label: 'Legs', labelHU: 'Láb', icon: '🦵' },
  { id: 'shoulders', label: 'Shoulders', labelHU: 'Váll', icon: '💪' },
  { id: 'arms', label: 'Arms', labelHU: 'Kar', icon: '💪' },
  { id: 'abs', label: 'Abs/Core', labelHU: 'Has', icon: '🎯' },
  { id: 'glutes', label: 'Glutes', labelHU: 'Far', icon: '🍑' },
  { id: 'full-body', label: 'Full Body', labelHU: 'Teljes test', icon: '🔥' }
];
```

### Exercise Numbers
```typescript
const exerciseCountOptions = [
  { value: 2, label: '2 exercises', labelHU: '2 gyakorlat', desc: 'Quick workout' },
  { value: 3, label: '3 exercises', labelHU: '3 gyakorlat', desc: 'Balanced' },
  { value: 4, label: '4 exercises', labelHU: '4 gyakorlat', desc: 'Comprehensive' },
  { value: 5, label: '5 exercises', labelHU: '5 gyakorlat', desc: 'Intense' },
  { value: 6, label: '6 exercises', labelHU: '6 gyakorlat', desc: 'Maximum volume' }
];
```

---

## Example Flow Timeline

| Time | User Action | API Response Type | Frontend Display |
|------|-------------|-------------------|------------------|
| 0:00 | "Create workout" | `muscleGroup` | Show muscle group buttons |
| 0:15 | Selects: Chest, Back, Arms | `exerciseNumber` | Show exercise count buttons |
| 0:25 | Selects: 4 exercises | `training` | Redirect to /training |

---

## Error Handling

```typescript
const handleError = (error: any) => {
  if (error.message.includes('timeout')) {
    showError('Request timed out. Please try again.');
    // Reset to chat mode
    setUIMode('chat');
  } else {
    showError('Something went wrong. Please try again.');
  }
};
```

---

## State Management

```typescript
// Track the training plan creation state
const [trainingState, setTrainingState] = useState({
  muscleGroups: [],
  exercisesPerMuscle: null,
  isComplete: false
});

// Update state as user progresses
useEffect(() => {
  if (data.responseType === 'exerciseNumber') {
    setTrainingState(prev => ({
      ...prev,
      muscleGroups: extractMuscleGroups(conversationHistory)
    }));
  } else if (data.category === 'training') {
    setTrainingState(prev => ({
      ...prev,
      exercisesPerMuscle: extractExerciseNumber(conversationHistory),
      isComplete: true
    }));
  }
}, [data]);
```

---

## Benefits

✅ **Clear UX** - User knows exactly what to provide at each step

✅ **Interactive** - Buttons are easier than typing

✅ **No Ambiguity** - Structured choices prevent confusion

✅ **Mobile Friendly** - Touch-friendly button interface

✅ **Progressive** - Can add more steps easily

✅ **Context Aware** - Conversation history maintains context

---

## Next Steps for Implementation

1. Create muscle group button component
2. Create exercise number selector component
3. Extract selected values from conversation history
4. Pass context to training section
5. Generate workout plan based on selections

---

## Future Enhancement Ideas

After muscle group and exercise number are collected, you could add more steps:

- **Step 3:** Training frequency (days per week)
- **Step 4:** Fitness level
- **Step 5:** Equipment available
- **Step 6:** Workout duration

Each with its own `responseType` for the frontend to display appropriate UI!

