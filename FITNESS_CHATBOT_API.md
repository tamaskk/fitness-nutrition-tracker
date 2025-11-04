# Fitness Chatbot API

## Overview
An AI-powered fitness chatbot that provides personalized fitness advice, workout recommendations, and nutrition guidance. The chatbot maintains conversation history and adapts responses based on user profile.

## Endpoint
```
POST /api/fitness/chat
```

## Authentication
Requires authentication via:
- NextAuth session (web)
- JWT token in Authorization header (mobile)

---

## What You Send (Request)

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token> (for mobile)
```

### Request Body

```json
{
  "message": "string (required)",
  "conversationHistory": [
    {
      "role": "user | assistant",
      "content": "string",
      "timestamp": "ISO 8601 date string (optional)"
    }
  ]
}
```

### Parameters

| Parameter | Type | Required | Max Length | Description |
|-----------|------|----------|------------|-------------|
| `message` | string | **Yes** | 1000 chars | The user's message/question |
| `conversationHistory` | array | No | 20 messages | Previous conversation messages |

### Conversation History Format

Each message in the history array:
```typescript
{
  role: "user" | "assistant",  // Required: who sent the message
  content: string,              // Required: the message content
  timestamp: string             // Optional: when the message was sent
}
```

**Important Notes:**
- Only the **last 20 messages** are considered (older messages are ignored)
- Only `user` and `assistant` roles are accepted
- System messages in history are filtered out
- Empty or invalid messages are filtered out

---

## What You Receive (Response)

### Success Response (200 OK)

```json
{
  "success": true,
  "response": "string",
  "conversationHistory": [
    {
      "role": "user | assistant",
      "content": "string",
      "timestamp": "ISO 8601 string"
    }
  ],
  "timestamp": "ISO 8601 string",
  "messageCount": number
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful responses |
| `response` | string | The AI's response to your message |
| `conversationHistory` | array | **Updated** conversation including your message and the AI's response |
| `timestamp` | string | ISO 8601 timestamp of when the response was generated |
| `messageCount` | number | Total number of messages in the conversation history |

---

## Complete Examples

### Example 1: First Message (No History)

**Request:**
```json
{
  "message": "I want to start working out but I'm a complete beginner. Where should I start?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Great decision to start your fitness journey! As a beginner, here's what I recommend:\n\n**Start with these fundamentals:**\n• Begin with 2-3 workout sessions per week (Monday, Wednesday, Friday works great)\n• Focus on full-body workouts combining basic movements\n• Start with bodyweight exercises: squats, push-ups (or knee push-ups), planks, and lunges\n• Each session should be 30-40 minutes including warm-up and cool-down\n• Warm up for 5-10 minutes with light cardio (walking, jumping jacks)\n\n**Key beginner tips:**\n• Form over weight - master the movement before adding resistance\n• Rest 48 hours between workouts for recovery\n• Stay hydrated and eat protein after workouts\n• Track your progress in a notebook or app\n• Don't compare yourself to others - focus on YOUR progress\n\nThe most important thing? Consistency beats intensity. Start small and build the habit. Would you like me to suggest a specific beginner workout routine for your first week?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "I want to start working out but I'm a complete beginner. Where should I start?",
      "timestamp": "2025-11-03T14:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Great decision to start your fitness journey! As a beginner, here's what I recommend:\n\n**Start with these fundamentals:**\n• Begin with 2-3 workout sessions per week (Monday, Wednesday, Friday works great)\n• Focus on full-body workouts combining basic movements\n• Start with bodyweight exercises: squats, push-ups (or knee push-ups), planks, and lunges\n• Each session should be 30-40 minutes including warm-up and cool-down\n• Warm up for 5-10 minutes with light cardio (walking, jumping jacks)\n\n**Key beginner tips:**\n• Form over weight - master the movement before adding resistance\n• Rest 48 hours between workouts for recovery\n• Stay hydrated and eat protein after workouts\n• Track your progress in a notebook or app\n• Don't compare yourself to others - focus on YOUR progress\n\nThe most important thing? Consistency beats intensity. Start small and build the habit. Would you like me to suggest a specific beginner workout routine for your first week?",
      "timestamp": "2025-11-03T14:00:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:00:00.000Z",
  "messageCount": 2
}
```

---

### Example 2: Continuing Conversation (With History)

**Request:**
```json
{
  "message": "Yes, please give me a workout routine!",
  "conversationHistory": [
    {
      "role": "user",
      "content": "I want to start working out but I'm a complete beginner. Where should I start?",
      "timestamp": "2025-11-03T14:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Great decision to start your fitness journey! [previous response...]",
      "timestamp": "2025-11-03T14:00:00.000Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Perfect! Here's your beginner-friendly Week 1 workout routine:\n\n**Monday - Full Body Basics**\n• Warm-up: 5 min walk/march in place\n• Bodyweight squats: 3 sets × 10 reps\n• Wall push-ups: 3 sets × 8 reps\n• Plank hold: 3 sets × 20 seconds\n• Lunges: 2 sets × 6 each leg\n• Cool-down: 5 min stretching\n\n**Wednesday - Same Routine**\nRepeat Monday's workout. Focus on feeling the movements and maintaining good form.\n\n**Friday - Progress Check**\nRepeat the routine, but try:\n• 12 squats instead of 10\n• 25-second planks\n• Moving from wall to knee push-ups if you feel ready\n\n**Important reminders:**\n• Rest 60-90 seconds between sets\n• If something hurts (not just burns), stop and adjust\n• Drink water before, during, and after\n• Aim for 7-8 hours of sleep for recovery\n\nHow does this look? Ready to crush your first workout on Monday?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "I want to start working out but I'm a complete beginner. Where should I start?",
      "timestamp": "2025-11-03T14:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Great decision to start your fitness journey! [previous response...]",
      "timestamp": "2025-11-03T14:00:00.000Z"
    },
    {
      "role": "user",
      "content": "Yes, please give me a workout routine!",
      "timestamp": "2025-11-03T14:05:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Perfect! Here's your beginner-friendly Week 1 workout routine: [full response...]",
      "timestamp": "2025-11-03T14:05:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:05:00.000Z",
  "messageCount": 4
}
```

---

### Example 3: Nutrition Question

**Request:**
```json
{
  "message": "What should I eat to lose weight? I'm 110kg and want to get to 70kg."
}
```

**Response:**
```json
{
  "success": true,
  "response": "Great question! For sustainable weight loss from 110kg to 70kg, here's your nutrition gameplan:\n\n**Calorie Strategy:**\n• Your maintenance is roughly 2,800-3,000 calories/day\n• Target: 2,200-2,400 calories/day for steady weight loss\n• This creates a 600-700 calorie deficit = 0.5-0.7kg loss per week\n\n**What to eat (Macros breakdown):**\n• Protein: 150-180g/day (chicken, fish, eggs, greek yogurt, legumes)\n• Carbs: 200-250g/day (brown rice, oats, quinoa, sweet potatoes)\n• Fats: 60-80g/day (olive oil, nuts, avocado, fatty fish)\n• Fiber: 30g+/day (vegetables, fruits, whole grains)\n\n**Practical meal structure:**\n• Breakfast: Protein + whole grain (eggs with oats, or greek yogurt with fruit)\n• Lunch: Protein + veggies + carbs (chicken breast, broccoli, brown rice)\n• Dinner: Protein + lots of veggies (fish with roasted vegetables)\n• Snacks: Fruits, nuts, protein shake\n\n**Key habits:**\n• Drink 3-4 liters of water daily\n• Eat slowly and stop when 80% full\n• Plan meals ahead (meal prep Sunday!)\n• Track food for first 2 weeks to learn portions\n\nRemember: losing 40kg will take 10-12 months if done healthily. This isn't a sprint! Want help planning a sample day of meals?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "What should I eat to lose weight? I'm 110kg and want to get to 70kg.",
      "timestamp": "2025-11-03T14:10:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Great question! For sustainable weight loss from 110kg to 70kg... [full response]",
      "timestamp": "2025-11-03T14:10:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:10:00.000Z",
  "messageCount": 2
}
```

---

### Example 4: Personalized Response (Uses User Profile)

When the user is logged in, the chatbot automatically accesses their profile data and personalizes responses:

**User Profile:**
- Name: Tamas
- Age: 25
- Weight: 110 kg
- Height: 192 cm
- Goal: Weight loss (110 kg → 70 kg)

**Request:**
```json
{
  "message": "How many calories should I eat per day?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on your stats, here's what I recommend:\n\n**Your Numbers:**\n• Maintenance calories: ~3,400 kcal/day (considering your height of 192cm and current weight)\n• For steady weight loss to reach your 70kg goal: **2,500-2,600 kcal/day**\n• This creates a ~850 calorie deficit for approximately 0.8kg loss per week\n\n**Why this works for you:**\nAt 192cm tall, you have a higher base metabolism than average. This means you can eat more while still losing weight compared to shorter individuals. The 2,500-2,600 range keeps you satisfied while creating consistent progress.\n\n**Breakdown for your day:**\n• Protein: 170-190g (to preserve muscle during weight loss)\n• Carbs: 250-280g (fuel for your workouts)\n• Fats: 70-80g (hormone production and satiety)\n\nThe good news? At your height and activity level, you won't feel deprived at 2,500+ calories! Many people lose weight on much less. Track your intake for 2 weeks and adjust based on your rate of loss. Aim for that sweet spot of 0.7-1kg per week.\n\nHow does this sound? Want help planning meals that hit these numbers?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "How many calories should I eat per day?",
      "timestamp": "2025-11-03T14:15:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Based on your stats, here's what I recommend... [full response]",
      "timestamp": "2025-11-03T14:15:00.000Z"
    }
  ],
  "timestamp": "2025-11-03T14:15:00.000Z",
  "messageCount": 2
}
```

---

## Error Responses

### 400 - Bad Request (Empty Message)
```json
{
  "success": false,
  "message": "Please provide a message"
}
```

### 400 - Bad Request (Message Too Long)
```json
{
  "success": false,
  "message": "Message is too long. Please keep it under 1000 characters."
}
```

### 401 - Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 405 - Method Not Allowed
```json
{
  "message": "Method not allowed"
}
```

### 429 - Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests. Please try again in a moment."
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Failed to process your message",
  "error": "Error details"
}
```

### 504 - Timeout
```json
{
  "success": false,
  "message": "Request timed out. Please try again."
}
```

---

## How to Use the Conversation History

### Initial Message
```javascript
// First message - no history
const response = await fetch('/api/fitness/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "How do I build muscle?"
  })
});

const data = await response.json();
// Save data.conversationHistory for next message
```

### Continuing the Conversation
```javascript
// Use the conversationHistory from previous response
const response = await fetch('/api/fitness/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What about protein intake?",
    conversationHistory: data.conversationHistory  // From previous response
  })
});

const newData = await response.json();
// Update conversationHistory with newData.conversationHistory
```

---

## ChatBot Personality

**FitPro** is your personal fitness coach who:

✅ **Expert Knowledge:**
- 15+ years of fitness coaching experience
- Specializes in: workouts, nutrition, weight management, muscle building
- Evidence-based advice backed by sports science

✅ **Communication Style:**
- Friendly and motivational
- Professional but approachable
- Uses simple, clear language
- Provides specific, actionable advice
- Breaks down complex topics

✅ **What FitPro Does:**
- Answers questions about exercise, diet, and fitness
- Creates personalized workout plans
- Provides nutrition guidance
- Motivates and encourages progress
- Sets realistic expectations
- Prioritizes safety

✅ **Response Format:**
- Concise but informative (2-4 paragraphs)
- Uses bullet points for lists
- Step-by-step instructions for routines
- Ends with encouragement or follow-up question

---

## Integration Example (Complete Flow)

```typescript
// State to store conversation
const [conversationHistory, setConversationHistory] = useState([]);
const [isLoading, setIsLoading] = useState(false);

// Function to send message
const sendMessage = async (userMessage: string) => {
  setIsLoading(true);
  
  try {
    const response = await fetch('/api/fitness/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory: conversationHistory
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Update conversation history with the response
      setConversationHistory(data.conversationHistory);
      
      // Display the AI's response
      console.log('FitPro:', data.response);
      
      return data.response;
    } else {
      console.error('Error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    return null;
  } finally {
    setIsLoading(false);
  }
};

// Usage
await sendMessage("I want to lose 10kg, help me!");
// Later...
await sendMessage("What exercises should I do?");
// The conversation history is automatically maintained
```

---

## Tips for Best Results

1. **Be Specific**: Instead of "I want to get fit", try "I want to lose 10kg and build muscle, I can work out 3 times a week"

2. **Provide Context**: Mention your fitness level, goals, limitations, and available equipment

3. **Ask Follow-up Questions**: The chatbot remembers the conversation, so you can ask for clarification or more details

4. **Use It Regularly**: Track your progress and come back to discuss challenges or adjust your plan

5. **Maintain History**: Always send the previous `conversationHistory` to keep context

---

## Conversation History Limits

- Maximum **20 previous messages** are considered
- Older messages are automatically dropped
- This prevents:
  - Token limit issues with OpenAI
  - Slow response times
  - High API costs

If you need to reference something from earlier, mention it explicitly in your new message.

---

## Privacy & Data

- Conversations are **not stored** in the database
- Each request is independent
- User profile data (weight, goals) is accessed for personalization but not modified
- Conversation history must be maintained by the client (frontend/mobile app)

---

## Response Time

- Typical response: **2-5 seconds**
- Longer conversations may take slightly more time
- Timeout after **30 seconds**

---

## Rate Limiting

The API uses OpenAI's GPT-4o-mini model. Be mindful of:
- API costs (charged per request)
- Rate limits (depends on your OpenAI plan)
- Implement client-side rate limiting if needed

---

## Future Enhancements

Potential features to add:
- Save favorite conversations
- Export chat history
- Voice input/output
- Image recognition for form checks
- Integration with workout tracking
- Progress photo analysis

