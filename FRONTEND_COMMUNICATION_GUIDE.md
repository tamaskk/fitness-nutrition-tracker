# Frontend Communication Guide

## Complete Flow: What to Send & Receive

---

## Step 1: Initial Request

### Frontend Sends:
```json
{
  "message": "Create a workout plan",
  "conversationHistory": []
}
```

### API Returns:
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
      "timestamp": "2025-11-05T18:48:50.040Z"
    },
    {
      "role": "assistant",
      "content": "muscleGroup",
      "timestamp": "2025-11-05T18:48:50.040Z"
    }
  ],
  "timestamp": "2025-11-05T18:48:50.040Z",
  "messageCount": 2
}
```

### Frontend Should:
1. **Check** `responseType === "muscleGroup"`
2. **Display** muscle group selection buttons
3. **Save** `conversationHistory` to state
4. **Wait** for user to select muscle groups

---

## Step 2: User Selects Muscle Groups

### User Action:
User clicks buttons and selects: `["Chest", "Back", "Shoulders"]`

### Frontend Sends:
```json
{
  "message": "I want to train: Chest, Back, Shoulders",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create a workout plan",
      "timestamp": "2025-11-05T18:48:50.040Z"
    },
    {
      "role": "assistant",
      "content": "muscleGroup",
      "timestamp": "2025-11-05T18:48:50.040Z"
    }
  ]
}
```

**KEY POINTS:**
- ✅ Message format: `"I want to train: Chest, Back, Shoulders"`
- ✅ Include the FULL `conversationHistory` from Step 1
- ✅ Don't add current message to history (API will do it)

### API Returns:
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
      "timestamp": "2025-11-05T18:48:50.040Z"
    },
    {
      "role": "assistant",
      "content": "muscleGroup",
      "timestamp": "2025-11-05T18:48:50.040Z"
    },
    {
      "role": "user",
      "content": "I want to train: Chest, Back, Shoulders",
      "timestamp": "2025-11-05T18:49:15.123Z"
    },
    {
      "role": "assistant",
      "content": "exerciseNumber",
      "timestamp": "2025-11-05T18:49:15.123Z"
    }
  ],
  "timestamp": "2025-11-05T18:49:15.123Z",
  "messageCount": 4
}
```

### Frontend Should:
1. **Check** `responseType === "exerciseNumber"`
2. **Display** exercise count selection buttons (2, 3, 4, 5, 6)
3. **Save** updated `conversationHistory` to state
4. **Wait** for user to select exercise count

---

## Step 3: User Selects Exercise Count

### User Action:
User clicks button and selects: `4`

### Frontend Sends:
```json
{
  "message": "4 exercises per muscle group",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create a workout plan",
      "timestamp": "2025-11-05T18:48:50.040Z"
    },
    {
      "role": "assistant",
      "content": "muscleGroup",
      "timestamp": "2025-11-05T18:48:50.040Z"
    },
    {
      "role": "user",
      "content": "I want to train: Chest, Back, Shoulders",
      "timestamp": "2025-11-05T18:49:15.123Z"
    },
    {
      "role": "assistant",
      "content": "exerciseNumber",
      "timestamp": "2025-11-05T18:49:15.123Z"
    }
  ]
}
```

**KEY POINTS:**
- ✅ Message format: `"4 exercises per muscle group"`
- ✅ Include the FULL `conversationHistory` from Step 2
- ✅ Don't add current message to history

### API Returns:
```json
{
  "success": true,
  "category": "training",
  "response": "training",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create a workout plan",
      "timestamp": "2025-11-05T18:48:50.040Z"
    },
    {
      "role": "assistant",
      "content": "muscleGroup",
      "timestamp": "2025-11-05T18:48:50.040Z"
    },
    {
      "role": "user",
      "content": "I want to train: Chest, Back, Shoulders",
      "timestamp": "2025-11-05T18:49:15.123Z"
    },
    {
      "role": "assistant",
      "content": "exerciseNumber",
      "timestamp": "2025-11-05T18:49:15.123Z"
    },
    {
      "role": "user",
      "content": "4 exercises per muscle group",
      "timestamp": "2025-11-05T18:49:35.789Z"
    },
    {
      "role": "assistant",
      "content": "training",
      "timestamp": "2025-11-05T18:49:35.789Z"
    }
  ],
  "timestamp": "2025-11-05T18:49:35.789Z",
  "messageCount": 6
}
```

### Frontend Should:
1. **Check** `category === "training"`
2. **Extract** user selections from conversation history
3. **Redirect** to training section with context

---

## Frontend Implementation

### React/TypeScript Example

```typescript
import { useState } from 'react';
import { useRouter } from 'next/router';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function TrainingChatbot() {
  const router = useRouter();
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [responseType, setResponseType] = useState<string | null>(null);

  // Send message to API
  const sendMessage = async (message: string) => {
    const response = await fetch('/api/fitness/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        conversationHistory: conversationHistory  // ← Always send current state
      })
    });

    const data = await response.json();
    
    // Update state with new conversation history
    setConversationHistory(data.conversationHistory);
    setResponseType(data.responseType);
    
    return data;
  };

  // Handle muscle group selection
  const handleMuscleGroupSelect = async (selectedMuscles: string[]) => {
    // Format message
    const message = `I want to train: ${selectedMuscles.join(', ')}`;
    
    // Send to API
    const data = await sendMessage(message);
    
    // Check what comes next
    if (data.responseType === 'exerciseNumber') {
      // Show exercise number selection
      setResponseType('exerciseNumber');
    }
  };

  // Handle exercise number selection
  const handleExerciseNumberSelect = async (count: number) => {
    // Format message
    const message = `${count} exercises per muscle group`;
    
    // Send to API
    const data = await sendMessage(message);
    
    // Check if ready for training
    if (data.category === 'training') {
      // Redirect to training section with context
      router.push({
        pathname: '/training',
        query: {
          context: JSON.stringify(data.conversationHistory)
        }
      });
    }
  };

  // Initial request
  const startTrainingPlan = async () => {
    const data = await sendMessage('Create a workout plan');
    
    if (data.responseType === 'muscleGroup') {
      setResponseType('muscleGroup');
    }
  };

  return (
    <div>
      {responseType === 'muscleGroup' && (
        <MuscleGroupSelector onSelect={handleMuscleGroupSelect} />
      )}
      
      {responseType === 'exerciseNumber' && (
        <ExerciseNumberSelector onSelect={handleExerciseNumberSelect} />
      )}
      
      {responseType === null && (
        <button onClick={startTrainingPlan}>Create Workout Plan</button>
      )}
    </div>
  );
}
```

---

## Message Formats

### For Muscle Groups:

**Single:**
```
"I want to train: Chest"
```

**Multiple:**
```
"I want to train: Chest, Back, Shoulders"
```

**Hungarian:**
```
"Szeretnék edzeni: Mell, Hát, Váll"
```

### For Exercise Numbers:

**English:**
```
"3 exercises per muscle group"
"4 exercises"
"5"
```

**Hungarian:**
```
"4 gyakorlat izmonként"
"3 gyakorlat"
```

---

## Response Type Decision Logic

```typescript
const handleResponse = (data: any) => {
  if (data.responseType === 'muscleGroup') {
    // Show muscle group buttons
    return 'SHOW_MUSCLE_BUTTONS';
  }
  
  if (data.responseType === 'exerciseNumber') {
    // Show exercise count buttons
    return 'SHOW_EXERCISE_BUTTONS';
  }
  
  if (data.category === 'training' && !data.responseType) {
    // Redirect to training section
    return 'REDIRECT_TO_TRAINING';
  }
  
  if (data.category === 'general' && !data.responseType) {
    // Show AI response in chat
    return 'SHOW_CHAT_MESSAGE';
  }
  
  // Other categories
  if (data.category === 'recipe') return 'REDIRECT_TO_RECIPES';
  if (data.category === 'finance') return 'REDIRECT_TO_FINANCE';
  if (data.category === 'shopping_list') return 'REDIRECT_TO_SHOPPING';
};
```

---

## Extracting Selections from History

When you redirect to training section, extract the user's choices:

```typescript
const extractTrainingDetails = (history: Message[]) => {
  const details = {
    muscleGroups: [] as string[],
    exercisesPerMuscle: 0
  };

  // Find muscle group response
  const muscleMessage = history.find(msg => 
    msg.role === 'user' && 
    (msg.content.includes('want to train') || msg.content.includes('edzeni'))
  );
  
  if (muscleMessage) {
    // Extract muscle groups from message
    const parts = muscleMessage.content.split(':');
    if (parts.length > 1) {
      details.muscleGroups = parts[1]
        .split(',')
        .map(m => m.trim())
        .filter(m => m.length > 0);
    }
  }

  // Find exercise number response
  const exerciseMessage = history.find(msg => 
    msg.role === 'user' && 
    (msg.content.includes('exercises') || msg.content.includes('gyakorlat'))
  );
  
  if (exerciseMessage) {
    // Extract number
    const match = exerciseMessage.content.match(/\d+/);
    if (match) {
      details.exercisesPerMuscle = parseInt(match[0]);
    }
  }

  return details;
};

// Usage in training page
const TrainingPage = () => {
  const router = useRouter();
  const context = JSON.parse(router.query.context as string);
  
  const details = extractTrainingDetails(context);
  
  console.log('Muscle Groups:', details.muscleGroups);
  // ['Chest', 'Back', 'Shoulders']
  
  console.log('Exercises per muscle:', details.exercisesPerMuscle);
  // 4
  
  // Now generate workout plan based on these details
};
```

---

## Quick Reference Table

| Step | Frontend Sends | API Returns | Frontend Action |
|------|----------------|-------------|-----------------|
| 1 | "Create workout" + `[]` history | `responseType: "muscleGroup"` | Show muscle buttons |
| 2 | "I want to train: X, Y" + history | `responseType: "exerciseNumber"` | Show number buttons |
| 3 | "N exercises" + history | `category: "training"` | Redirect to /training |

---

## Common Mistakes

### ❌ Wrong: Adding current message to history

```typescript
// DON'T DO THIS
const newHistory = [...conversationHistory, {
  role: 'user',
  content: message,
  timestamp: new Date().toISOString()
}];

await fetch('/api/fitness/chat', {
  body: JSON.stringify({
    message: message,
    conversationHistory: newHistory  // ← Wrong!
  })
});
```

### ✅ Correct: Send history as-is

```typescript
// DO THIS
await fetch('/api/fitness/chat', {
  body: JSON.stringify({
    message: message,
    conversationHistory: conversationHistory  // ← Correct!
  })
});
```

---

## Debugging Checklist

If training flow is broken:

- [ ] Is `conversationHistory` being saved to state after each response?
- [ ] Is the saved `conversationHistory` being sent in the next request?
- [ ] Are you formatting messages correctly? (`"I want to train: X, Y"`)
- [ ] Are you checking `data.responseType` to decide what UI to show?
- [ ] Are you NOT adding the current message to history before sending?

---

## Summary

**The Rule:** Always send back the FULL `conversationHistory` you received from the previous API response, along with the new message.

**The Flow:**
1. Send message + history → Get `responseType: "muscleGroup"`
2. Send muscles + updated history → Get `responseType: "exerciseNumber"`
3. Send count + updated history → Get `category: "training"`

That's it! The API handles everything else. 🎯

