# Fitness Chatbot API with Smart Classification

## Overview
An AI-powered fitness chatbot that **automatically classifies** user messages into categories and responds accordingly. The chatbot can identify specific intents (training, recipes, finance, shopping) or provide detailed answers for general questions.

## Endpoint
```
POST /api/fitness/chat
```

## How It Works

### Two-Step Process:

1. **Classification** - Every message is first analyzed and categorized
2. **Response** - Based on the category, returns either:
   - The category name (for specific intents)
   - A detailed AI response (for general questions)

---

## Message Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `training` | Workout, exercise, fitness routines | "I want to build muscle", "What exercises for abs?", "Create a workout plan" |
| `recipe` | Cooking, meal preparation, recipes | "How to cook chicken breast?", "Give me a protein recipe", "Healthy meal ideas" |
| `finance` | Money, budgeting, expenses | "Track my expenses", "Budget for groceries", "How much did I spend?" |
| `shopping_list` | Shopping, groceries, buying items | "What should I buy for meal prep?", "Add items to shopping list", "Grocery recommendations" |
| `general` | Everything else | "How many calories should I eat?", "I need motivation", "Hello!", "Nutrition advice" |

---

## Request Format

```json
{
  "message": "Your question here (max 1000 chars)",
  "conversationHistory": [
    {
      "role": "user | assistant",
      "content": "string",
      "timestamp": "ISO 8601 string"
    }
  ]
}
```

---

## Response Formats

### For Specific Categories (training, recipe, finance, shopping_list)

When the message is about training, recipe, finance, or shopping list, you get:

```json
{
  "success": true,
  "category": "training",
  "response": "training",
  "conversationHistory": [
    {
      "role": "user",
      "content": "I want to build muscle",
      "timestamp": "2025-11-03T14:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "training",
      "timestamp": "2025-11-03T14:00:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:00:00.000Z",
  "messageCount": 2
}
```

**Key Fields:**
- `category`: The detected category (training, recipe, finance, or shopping_list)
- `response`: Same as category (for consistency)
- The conversation history saves just the category name

---

### For General Questions

When the message is a general question, you get a full AI response:

```json
{
  "success": true,
  "category": "general",
  "response": "Based on your profile, I recommend eating 2,500 calories per day for steady weight loss. Here's why...",
  "conversationHistory": [
    {
      "role": "user",
      "content": "How many calories should I eat?",
      "timestamp": "2025-11-03T14:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Based on your profile, I recommend eating 2,500 calories per day...",
      "timestamp": "2025-11-03T14:00:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:00:00.000Z",
  "messageCount": 2
}
```

**Key Fields:**
- `category`: "general"
- `response`: Full detailed answer from the AI fitness coach
- The conversation history saves the complete AI response

---

## Complete Examples

### Example 1: Training Question

**Request:**
```json
{
  "message": "I want to start strength training"
}
```

**Response:**
```json
{
  "success": true,
  "category": "training",
  "response": "training",
  "conversationHistory": [
    {
      "role": "user",
      "content": "I want to start strength training",
      "timestamp": "2025-11-03T14:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "training",
      "timestamp": "2025-11-03T14:00:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:00:00.000Z",
  "messageCount": 2
}
```

**What to do:** When you receive `category: "training"`, redirect the user to your training/workout section or show training-specific UI.

---

### Example 2: Recipe Question

**Request:**
```json
{
  "message": "How do I make grilled chicken?"
}
```

**Response:**
```json
{
  "success": true,
  "category": "recipe",
  "response": "recipe",
  "conversationHistory": [
    {
      "role": "user",
      "content": "How do I make grilled chicken?",
      "timestamp": "2025-11-03T14:05:00.000Z"
    },
    {
      "role": "assistant",
      "content": "recipe",
      "timestamp": "2025-11-03T14:05:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:05:00.000Z",
  "messageCount": 2
}
```

**What to do:** Redirect to recipe section or recipe generator.

---

### Example 3: Finance Question

**Request:**
```json
{
  "message": "Help me track my food expenses"
}
```

**Response:**
```json
{
  "success": true,
  "category": "finance",
  "response": "finance",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Help me track my food expenses",
      "timestamp": "2025-11-03T14:10:00.000Z"
    },
    {
      "role": "assistant",
      "content": "finance",
      "timestamp": "2025-11-03T14:10:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:10:00.000Z",
  "messageCount": 2
}
```

**What to do:** Redirect to finance/budget tracking section.

---

### Example 4: Shopping List Question

**Request:**
```json
{
  "message": "What should I buy for this week's meal prep?"
}
```

**Response:**
```json
{
  "success": true,
  "category": "shopping_list",
  "response": "shopping_list",
  "conversationHistory": [
    {
      "role": "user",
      "content": "What should I buy for this week's meal prep?",
      "timestamp": "2025-11-03T14:15:00.000Z"
    },
    {
      "role": "assistant",
      "content": "shopping_list",
      "timestamp": "2025-11-03T14:15:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:15:00.000Z",
  "messageCount": 2
}
```

**What to do:** Redirect to shopping list section.

---

### Example 5: General Question (Full Response)

**Request:**
```json
{
  "message": "How many calories should I eat to lose weight?"
}
```

**Response:**
```json
{
  "success": true,
  "category": "general",
  "response": "Based on your profile and goal to lose 40kg, here's what I recommend:\n\n**Your Daily Calorie Target: 2,500 calories**\n\nThis creates an 850-calorie deficit from your maintenance level of 3,410 calories. At this rate, you'll lose approximately 0.8kg per week, which is perfect for sustainable weight loss.\n\n**Why this works for you:**\n• Your height (192cm) means higher calorie needs\n• Gradual deficit prevents muscle loss\n• Sustainable long-term (you won't feel starving!)\n• Allows for 3-4 workouts per week\n\n**Macro breakdown:**\n• Protein: 170-190g (muscle preservation)\n• Carbs: 250-280g (energy for workouts)\n• Fats: 70-80g (hormone health)\n\nStart tracking for 2 weeks and adjust if needed. You're aiming for 0.7-1kg loss per week. Ready to crush this goal?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "How many calories should I eat to lose weight?",
      "timestamp": "2025-11-03T14:20:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Based on your profile and goal to lose 40kg, here's what I recommend...",
      "timestamp": "2025-11-03T14:20:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:20:00.000Z",
  "messageCount": 2
}
```

**What to do:** Display the full AI response to the user in the chat interface.

---

### Example 6: Greeting (General)

**Request:**
```json
{
  "message": "Hello! I'm new here"
}
```

**Response:**
```json
{
  "success": true,
  "category": "general",
  "response": "Hey there! Welcome to your fitness journey! I'm FitPro, your personal AI fitness coach, and I'm here to help you reach your goals.\n\nI can help you with:\n• Creating personalized workout plans\n• Nutrition and meal planning advice\n• Weight loss or muscle building strategies\n• Exercise technique and form\n• Motivation and accountability\n\nI see you're aiming to lose 40kg - that's an awesome goal! I'm here to support you every step of the way. What would you like to work on first? Want to talk about workouts, nutrition, or maybe just need some motivation?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hello! I'm new here",
      "timestamp": "2025-11-03T14:25:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Hey there! Welcome to your fitness journey!...",
      "timestamp": "2025-11-03T14:25:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:25:00.000Z",
  "messageCount": 2
}
```

---

## Classification Examples Table

| User Message | Category | Response Type |
|--------------|----------|---------------|
| "Create a workout plan for me" | `training` | Category name only |
| "Give me a recipe for protein pancakes" | `recipe` | Category name only |
| "How much money did I spend on food?" | `finance` | Category name only |
| "What groceries should I buy?" | `shopping_list` | Category name only |
| "How many calories should I eat?" | `general` | Full AI response |
| "I need motivation to keep going" | `general` | Full AI response |
| "What is protein?" | `general` | Full AI response |
| "Best exercises for abs" | `training` | Category name only |
| "Healthy dinner ideas" | `recipe` | Category name only |

---

## Frontend Integration Example

```typescript
const [conversationHistory, setConversationHistory] = useState([]);

const sendMessage = async (userMessage: string) => {
  const response = await fetch('/api/fitness/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage,
      conversationHistory: conversationHistory
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    // Update conversation history
    setConversationHistory(data.conversationHistory);
    
    // Handle based on category
    if (data.category === 'training') {
      // Redirect to training section
      router.push('/training');
      showToast('Let me help you with your workout!');
    } 
    else if (data.category === 'recipe') {
      // Redirect to recipes section
      router.push('/recipes');
      showToast('Let me find you a great recipe!');
    }
    else if (data.category === 'finance') {
      // Redirect to finance section
      router.push('/finance');
      showToast('Opening your financial tracking...');
    }
    else if (data.category === 'shopping_list') {
      // Redirect to shopping list
      router.push('/shopping');
      showToast('Let me help with your shopping list!');
    }
    else if (data.category === 'general') {
      // Display the AI response in chat
      displayChatMessage(data.response);
    }
    
    return data;
  }
};

// Usage
await sendMessage("I want to build muscle");  // → Redirects to training
await sendMessage("How many calories do I need?");  // → Shows AI response
```

---

## Mobile App Example (React Native)

```typescript
const handleUserMessage = async (message: string) => {
  const response = await apiClient.post('/api/fitness/chat', {
    message,
    conversationHistory
  });

  const { category, response: aiResponse } = response.data;

  switch (category) {
    case 'training':
      navigation.navigate('Training');
      showAlert('Training Mode', 'Let me help you with your workout!');
      break;
    
    case 'recipe':
      navigation.navigate('Recipes');
      showAlert('Recipe Mode', 'Let me find you a great recipe!');
      break;
    
    case 'finance':
      navigation.navigate('Finance');
      showAlert('Finance Mode', 'Opening your expense tracker...');
      break;
    
    case 'shopping_list':
      navigation.navigate('Shopping');
      showAlert('Shopping Mode', 'Let me help with your list!');
      break;
    
    case 'general':
      // Display AI response in chat
      addMessageToChat('assistant', aiResponse);
      break;
  }

  setConversationHistory(response.data.conversationHistory);
};
```

---

## Why This Approach?

### Benefits:

1. **Smart Routing**: Automatically directs users to relevant sections
2. **Better UX**: Users get taken to the right feature immediately
3. **Saves API Costs**: Category responses are much shorter than full AI responses
4. **Context Awareness**: The system knows what the user wants
5. **Flexibility**: General questions still get detailed answers

### Use Cases:

- **User says "I want to workout"** → Opens training section
- **User says "How do I cook salmon?"** → Opens recipe generator/search
- **User says "Track my spending"** → Opens finance tracker
- **User says "What should I buy?"** → Opens shopping list
- **User says "How many calories?"** → Gets detailed nutritional advice in chat

---

## Error Handling

All error responses remain the same as the original API. See main documentation for details.

---

## Performance

- **Classification**: ~1-2 seconds
- **General Response**: ~2-5 seconds (includes classification + AI response)
- **Total for specific categories**: ~1-2 seconds (classification only)

---

## Authentication

Same as original API - requires NextAuth session or JWT token.

---

## Response Fields Summary

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always true for successful requests |
| `category` | string | One of: training, recipe, finance, shopping_list, general |
| `response` | string | Category name OR full AI response (depending on category) |
| `conversationHistory` | array | Updated conversation including your message and response |
| `timestamp` | string | ISO 8601 timestamp |
| `messageCount` | number | Total messages in conversation |

---

## Tips

✅ **Always check the `category` field** to determine how to handle the response

✅ **For specific categories**, redirect users to appropriate sections

✅ **For general category**, display the `response` in your chat UI

✅ **Maintain `conversationHistory`** across all message types

✅ **Use the category** to provide visual feedback (icons, colors, etc.)

---

## Next Steps

1. Implement category-based routing in your frontend
2. Design category-specific UI responses
3. Add visual indicators for different categories
4. Test with various user messages to ensure proper classification
5. Monitor classification accuracy and adjust if needed

