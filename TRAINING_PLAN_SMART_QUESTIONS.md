# Training Plan Smart Questions

## Overview

When a user requests a training/workout plan but doesn't provide enough details, the chatbot will **automatically ask follow-up questions** to gather the necessary information before redirecting to the training section.

---

## How It Works

### Flow Diagram

```
User: "Create a workout plan"
    ↓
Classify: "training"
    ↓
Check: Has enough details?
    ↓
NO → Ask follow-up questions (return as "general")
    ↓
User: Provides details
    ↓
Check: Has enough details?
    ↓
YES → Return "training" (redirect to training section)
```

---

## Required Information

The system checks for **at least 3** of these details:

1. **Target muscle groups** - Which muscles to focus on
2. **Exercises per muscle** - How many exercises per muscle group
3. **Training frequency** - How many days per week
4. **Fitness level** - Beginner, intermediate, or advanced
5. **Equipment available** - Gym, home, bodyweight, etc.
6. **Workout duration** - Time available per session

---

## Example Scenarios

### Scenario 1: Insufficient Details

**User Request:**
```
"Create a workout plan for me"
```

**What Happens:**
1. Classified as: `training`
2. Details check: ❌ Missing (no muscle groups, frequency, etc.)
3. Bot asks questions

**Response:**
```json
{
  "success": true,
  "category": "general",
  "needsMoreInfo": true,
  "pendingCategory": "training",
  "response": "I'd love to create a workout plan for you! To make it perfect, I need a few details:\n\n• Which muscle groups do you want to focus on? (e.g., full body, upper/lower split, specific muscles)\n• How many days per week can you train?\n• What equipment do you have access to? (gym, home equipment, bodyweight)\n• What's your current fitness level? (beginner, intermediate, advanced)\n\nLet me know and I'll design the perfect plan for you!",
  "conversationHistory": [...],
  "timestamp": "...",
  "messageCount": 2
}
```

**Frontend Action:** Display the AI's questions in the chat, don't redirect yet

---

### Scenario 2: User Provides More Details

**User Reply:**
```
"I want to train chest and back, 3 days a week, I have a gym membership and I'm intermediate level"
```

**What Happens:**
1. Classified as: `training`
2. Details check: ✅ Has enough info
   - ✓ Muscle groups: chest and back
   - ✓ Frequency: 3 days/week
   - ✓ Equipment: gym
   - ✓ Fitness level: intermediate
3. Returns "training"

**Response:**
```json
{
  "success": true,
  "category": "training",
  "response": "training",
  "conversationHistory": [...],
  "timestamp": "...",
  "messageCount": 4
}
```

**Frontend Action:** Redirect to training section with full context

---

### Scenario 3: Already Has Details

**User Request:**
```
"Create a 5-day upper/lower split for intermediate lifter, 4 exercises per muscle group, 60 minutes per session"
```

**What Happens:**
1. Classified as: `training`
2. Details check: ✅ Has enough info
   - ✓ Frequency: 5 days
   - ✓ Split type: upper/lower
   - ✓ Fitness level: intermediate
   - ✓ Exercises per muscle: 4
   - ✓ Duration: 60 minutes
3. Returns "training" immediately

**Response:**
```json
{
  "success": true,
  "category": "training",
  "response": "training",
  "conversationHistory": [...],
  "timestamp": "...",
  "messageCount": 2
}
```

**Frontend Action:** Redirect to training section immediately

---

## Response Fields

### When Asking for More Info

```json
{
  "success": true,
  "category": "general",           // Treated as general conversation
  "needsMoreInfo": true,            // NEW: Indicates missing details
  "pendingCategory": "training",    // NEW: What category it will be once details are provided
  "response": "Questions...",       // AI-generated follow-up questions
  "conversationHistory": [...],
  "timestamp": "...",
  "messageCount": 2
}
```

### When Enough Details Provided

```json
{
  "success": true,
  "category": "training",           // Ready to redirect
  "response": "training",
  "conversationHistory": [...],
  "timestamp": "...",
  "messageCount": 4
}
```

---

## Frontend Integration

### Basic Implementation

```typescript
const handleChatResponse = async (data: any) => {
  if (data.needsMoreInfo) {
    // User needs to provide more details
    // Display the follow-up questions in chat
    displayInChat(data.response);
    
    // Optional: Show a hint that training plan will be created once details are provided
    showHint(`I'm gathering details to create your ${data.pendingCategory} plan!`);
  }
  else if (data.category === 'training') {
    // Enough details - redirect to training section
    router.push('/training', {
      state: {
        conversationHistory: data.conversationHistory,
        userRequest: getUserLastMessage(data.conversationHistory)
      }
    });
  }
  else if (data.category === 'general') {
    // Regular chat response
    displayInChat(data.response);
  }
};
```

### Advanced Implementation with State

```typescript
const [pendingCategory, setPendingCategory] = useState<string | null>(null);

const handleMessage = async (message: string) => {
  const response = await fetch('/api/fitness/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationHistory
    })
  });

  const data = await response.json();
  
  if (data.needsMoreInfo) {
    // Store what we're waiting for
    setPendingCategory(data.pendingCategory);
    
    // Display questions
    displayInChat(data.response);
    
    // Show visual indicator
    showBadge(`Creating ${data.pendingCategory} plan...`);
  }
  else if (data.category === 'training' && pendingCategory === 'training') {
    // User provided all details, now redirect
    setPendingCategory(null);
    
    showSuccess('Great! Let me create your training plan!');
    
    router.push('/training', {
      state: { context: data.conversationHistory }
    });
  }
  else if (data.category === 'general') {
    // Regular conversation
    displayInChat(data.response);
  }
  
  setConversationHistory(data.conversationHistory);
};
```

---

## Complete Conversation Example

### Turn 1: Initial Request

**User:** "I want a workout plan"

**Bot Response:**
```
I'd love to create a workout plan for you! To make it perfect, I need a few details:

• Which muscle groups do you want to focus on? (e.g., full body, upper/lower split, legs and shoulders)
• How many days per week can you train?
• What equipment do you have? (gym, dumbbells, bodyweight)
• What's your fitness level?

Let me know and I'll design the perfect plan!
```

**Response Data:**
```json
{
  "category": "general",
  "needsMoreInfo": true,
  "pendingCategory": "training"
}
```

---

### Turn 2: Partial Details

**User:** "I can train 4 days a week at the gym"

**Bot Response:**
```
Great! 4 days per week at the gym is perfect. Just a couple more things:

• Which muscles do you want to prioritize? (e.g., chest and arms, legs and back, full body)
• What's your experience level? (beginner, intermediate, advanced)
• How many exercises per muscle group would you like?
```

**Response Data:**
```json
{
  "category": "general",
  "needsMoreInfo": true,
  "pendingCategory": "training"
}
```

---

### Turn 3: Complete Details

**User:** "I'm intermediate, want to focus on chest, back and legs, 4-5 exercises per muscle"

**Bot Response:**
```json
{
  "category": "training",
  "response": "training"
}
```

**Frontend:** Redirects to training section with full conversation context

---

## Types of Questions Asked

The AI will intelligently ask about missing information:

### Common Questions

- "Which muscle groups do you want to target?"
- "How many days per week can you workout?"
- "What equipment do you have access to?"
- "What's your current fitness level?"
- "How much time do you have per workout?"
- "How many exercises per muscle group?"
- "Any specific goals? (strength, hypertrophy, endurance)"
- "Do you have any limitations or injuries?"

### Smart Context

The AI considers:
- What was already mentioned
- What's most important for the plan
- User's previous messages in conversation

---

## Benefits

✅ **Better Training Plans** - Complete information = better recommendations

✅ **User Engagement** - Interactive conversation feels natural

✅ **Reduced Errors** - Don't create plans with missing information

✅ **Smarter Routing** - Only redirect when truly ready

✅ **Context Preservation** - Training section receives full conversation history

---

## Configuration

### Adjust Detail Requirements

In the `checkTrainingDetails` function, you can modify:

```typescript
// Currently requires at least 3 of 6 details
// Change the logic in the prompt to require more or fewer details
```

### Customize Questions

The follow-up questions are AI-generated based on what's missing. To customize:

```typescript
// In the followUpCompletion system prompt:
content: `You are a fitness coach. Ask specific questions about:
- Custom requirement 1
- Custom requirement 2
...
`
```

---

## API Changes Summary

### New Response Fields

| Field | Type | When Present | Description |
|-------|------|--------------|-------------|
| `needsMoreInfo` | boolean | When details are missing | Indicates follow-up needed |
| `pendingCategory` | string | When `needsMoreInfo` is true | What category will be assigned after details provided |

### Backward Compatibility

✅ Existing integrations work unchanged

✅ New fields are optional - frontend can ignore them

✅ Old behavior: Immediately returns "training"

✅ New behavior: Asks questions first, then returns "training"

---

## Testing Scenarios

| User Message | Has Details? | Response |
|--------------|--------------|----------|
| "Create workout plan" | ❌ | Asks questions |
| "Workout for chest and back" | ❌ | Asks for frequency, equipment, level |
| "3-day full body plan, beginner, gym" | ✅ | Returns "training" |
| "Upper/lower split, 5 exercises per muscle, 4 days, intermediate, home gym" | ✅ | Returns "training" |
| "Give me leg workout" | ❌ | Asks for exercises count, frequency, etc. |

---

## Future Enhancements

Potential improvements:
- Save partial details in user profile
- Pre-fill questions based on user profile
- Allow users to skip optional details
- Provide default values for missing information
- Visual progress indicator for detail collection

