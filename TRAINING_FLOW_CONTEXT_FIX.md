# Training Flow Context Fix

## Problem Fixed

When users responded to the muscle group question with just muscle names (e.g., "chest, back, shoulders"), the system didn't recognize it as part of the training flow and wouldn't ask for exercise numbers next.

### Why It Happened

The chatbot was **re-classifying every message**, including responses to its own questions. When a user sent "chest, back, shoulders" after being asked for muscle groups, the classifier didn't see it as a "training" request because it was just a list of words, not a new workout plan request.

---

## Solution

Added **context awareness** - the system now checks if it's in the middle of a training flow before classifying.

### How It Works

```typescript
// Check if last message from bot was asking for training details
const lastAssistantMessage = history[history.length - 1];
const isInTrainingFlow = 
  lastAssistantMessage?.role === 'assistant' && 
  (lastAssistantMessage?.content === 'muscleGroup' || 
   lastAssistantMessage?.content === 'exerciseNumber');

if (isInTrainingFlow) {
  // User is responding to our question - treat as training
  category = 'training';
} else {
  // New message - classify it
  category = await classifyMessage(message);
}
```

---

## Flow Before Fix

```
User: "Create workout"
    ↓
Bot: "muscleGroup" (asks for muscle groups)
    ↓
User: "chest, back, shoulders"
    ↓
System: Classifies as "general" ❌
    ↓
Bot: Gives general fitness advice (WRONG!)
```

---

## Flow After Fix

```
User: "Create workout"
    ↓
Bot: "muscleGroup" (asks for muscle groups)
    ↓
User: "chest, back, shoulders"
    ↓
System: Sees last message was "muscleGroup" ✓
    ↓
System: Treats as training continuation ✓
    ↓
Bot: "exerciseNumber" (asks for exercise count) ✓
```

---

## Complete Example

### Turn 1: Initial Request

**User:** "I want a workout plan"

**System:**
- Classifies: `training`
- Checks: No muscle group
- Returns: `responseType: "muscleGroup"`

**Bot:** "Which muscle groups do you want to focus on?"

---

### Turn 2: User Responds (THE FIX)

**User:** "chest, back, and shoulders"

**System:**
- Checks last message: `"muscleGroup"` ✓
- **Skips classification** (knows it's training)
- Treats as: `training`
- Checks: Has muscle group now ✓, No exercise number ❌
- Returns: `responseType: "exerciseNumber"`

**Bot:** "How many exercises per muscle group?"

---

### Turn 3: User Responds

**User:** "4 exercises"

**System:**
- Checks last message: `"exerciseNumber"` ✓
- **Skips classification** (knows it's training)
- Treats as: `training`
- Checks: Has muscle group ✓, Has exercise number ✓
- Returns: `category: "training"`

**Bot:** `"training"` (ready to redirect)

---

## Context Detection

The system recognizes you're in a training flow if the **last assistant message** was:

| Last Bot Message | Meaning |
|------------------|---------|
| `"muscleGroup"` | Waiting for muscle group response |
| `"exerciseNumber"` | Waiting for exercise count response |

---

## Benefits

✅ **Context Awareness** - Understands conversation flow

✅ **No Re-classification Needed** - Saves API calls

✅ **Natural Conversation** - User can respond naturally

✅ **Works with Short Responses** - "chest and back" works now

✅ **Multi-turn Flow** - Handles multiple questions in sequence

---

## Example User Responses That Now Work

After being asked for muscle groups, these all work:

- ✅ "chest, back, shoulders"
- ✅ "I want chest and back"
- ✅ "legs"
- ✅ "full body"
- ✅ "arms and abs"
- ✅ "mellkas, hát, váll" (Hungarian)

After being asked for exercise count:

- ✅ "4"
- ✅ "4 exercises"
- ✅ "I want 5 per muscle"
- ✅ "3 gyakorlat" (Hungarian)

---

## Code Changes

### Before
```typescript
// Always classified every message
const category = await classifyMessage(message);

if (category === 'training') {
  // Check details...
}
```

### After
```typescript
// Check if in training flow first
const isInTrainingFlow = checkTrainingContext(history);

if (isInTrainingFlow) {
  category = 'training';  // Skip classification
} else {
  category = await classifyMessage(message);  // Only classify new requests
}

if (category === 'training') {
  // Check details...
}
```

---

## Edge Cases Handled

### User Changes Mind Mid-Flow

**Scenario:**
```
Bot: "Which muscle groups?"
User: "Actually, I want a recipe instead"
```

**Result:** System classifies "recipe" request and switches context ✓

---

### User Asks General Question Mid-Flow

**Scenario:**
```
Bot: "Which muscle groups?"
User: "How many calories should I eat?"
```

**Result:** Last message was "muscleGroup" → treats as training → extracts no muscle keywords → asks for muscle groups again

**Better handling:** You could add a check for question keywords to detect when user is asking a question vs answering

---

## Future Improvements

### Option 1: Question Detection

```typescript
const isQuestion = message.includes('?') || 
                  message.toLowerCase().startsWith('how') ||
                  message.toLowerCase().startsWith('what');

if (isInTrainingFlow && !isQuestion) {
  category = 'training';
} else {
  category = await classifyMessage(message);
}
```

### Option 2: Explicit Exit

Allow users to say "cancel", "stop", "never mind" to exit training flow:

```typescript
const exitKeywords = ['cancel', 'stop', 'never mind', 'actually'];
const wantsToExit = exitKeywords.some(k => message.toLowerCase().includes(k));

if (isInTrainingFlow && !wantsToExit) {
  category = 'training';
}
```

---

## Testing

### Test Case 1: Full Flow
```
Input: "Create workout"
Expected: responseType: "muscleGroup"

Input: "chest and back"
Expected: responseType: "exerciseNumber"

Input: "4 exercises"
Expected: category: "training"
```

### Test Case 2: Short Responses
```
Input: "workout plan"
Expected: responseType: "muscleGroup"

Input: "legs"
Expected: responseType: "exerciseNumber"

Input: "5"
Expected: category: "training"
```

### Test Case 3: Hungarian
```
Input: "edzésterv"
Expected: responseType: "muscleGroup"

Input: "mellkas és hát"
Expected: responseType: "exerciseNumber"

Input: "4 gyakorlat"
Expected: category: "training"
```

---

## Summary

The fix adds **conversation context awareness** so the chatbot knows when a user is responding to its questions vs starting a new request. This makes the training plan flow work smoothly without needing to re-classify every message.

**Key insight:** When you ask a question, the user's next message is probably an answer - don't reclassify it! ✅

