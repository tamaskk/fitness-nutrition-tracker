# Fitness Chatbot - Quick Reference

## Endpoint
```
POST /api/fitness/chat
```

## Request Format
```json
{
  "message": "Your question here (max 1000 chars)",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous user message",
      "timestamp": "2025-11-03T14:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Previous AI response",
      "timestamp": "2025-11-03T14:00:00.000Z"
    }
  ]
}
```

## Response Format
```json
{
  "success": true,
  "response": "AI's answer to your question",
  "conversationHistory": [
    // Your message + AI response appended to history
  ],
  "timestamp": "2025-11-03T14:05:00.000Z",
  "messageCount": 4
}
```

## Simple Examples

### First Message
```javascript
// Request
{
  "message": "How do I lose belly fat?"
}

// Response
{
  "success": true,
  "response": "To lose belly fat effectively... [detailed advice]",
  "conversationHistory": [
    { "role": "user", "content": "How do I lose belly fat?", "timestamp": "..." },
    { "role": "assistant", "content": "To lose belly fat effectively...", "timestamp": "..." }
  ],
  "timestamp": "2025-11-03T14:00:00.000Z",
  "messageCount": 2
}
```

### Follow-up Message
```javascript
// Request (use previous conversationHistory)
{
  "message": "What exercises work best?",
  "conversationHistory": [
    { "role": "user", "content": "How do I lose belly fat?", "timestamp": "..." },
    { "role": "assistant", "content": "To lose belly fat effectively...", "timestamp": "..." }
  ]
}

// Response
{
  "success": true,
  "response": "For belly fat reduction, these exercises... [detailed advice]",
  "conversationHistory": [
    // Previous 2 messages + your new message + AI response = 4 total
  ],
  "messageCount": 4
}
```

## Key Points

✅ **Always send `conversationHistory`** from the previous response to maintain context

✅ **Max message length**: 1000 characters

✅ **Max history**: Last 20 messages are kept (older ones dropped)

✅ **Chatbot knows your profile**: Automatically accesses your weight, goals, age, etc. for personalized advice

✅ **No storage**: Conversation history is NOT saved in database - client must maintain it

## What the Chatbot Can Help With

- Workout routines and exercise advice
- Nutrition and meal planning
- Weight loss/gain strategies
- Muscle building tips
- Form and technique guidance
- Motivation and goal setting
- Recovery and injury prevention
- Supplement advice
- Sleep and stress management

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Missing or invalid message |
| 401 | Not authenticated |
| 429 | Too many requests |
| 500 | Server error |
| 504 | Request timeout |

## Quick Integration

```typescript
const [history, setHistory] = useState([]);

async function chat(message: string) {
  const res = await fetch('/api/fitness/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationHistory: history
    })
  });
  
  const data = await res.json();
  
  if (data.success) {
    setHistory(data.conversationHistory);
    return data.response;
  }
}

// Usage
await chat("I want to start lifting weights");
await chat("Should I do full body or split routines?");
```

## Tips

💡 Be specific with your questions

💡 Mention your fitness level and constraints

💡 Ask follow-up questions for clarification

💡 The bot remembers the conversation context

💡 Use bullet points or questions for better responses

---

For full documentation, see `FITNESS_CHATBOT_API.md`

