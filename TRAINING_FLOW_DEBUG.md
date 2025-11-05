# Training Flow Debug Guide

## Issue: "Is in training flow? false"

When the bot asks for muscle groups, and the user responds, the system says "Is in training flow? false" and treats it as a general question instead of continuing the training flow.

---

## What Should Happen

### Request 1 (Initial):
```json
{
  "message": "Create workout",
  "conversationHistory": []
}
```

**Response 1:**
```json
{
  "responseType": "muscleGroup",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create workout",
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

---

### Request 2 (User Responds):

**CRITICAL**: The frontend MUST send the FULL conversation history from Response 1:

```json
{
  "message": "Mell, Tricepsz",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create workout",
      "timestamp": "2025-11-05T18:48:50.040Z"
    },
    {
      "role": "assistant",
      "content": "muscleGroup",  // ← MUST BE INCLUDED!
      "timestamp": "2025-11-05T18:48:50.040Z"
    }
  ]
}
```

**Response 2:**
```json
{
  "responseType": "exerciseNumber",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create workout",
      "timestamp": "..."
    },
    {
      "role": "assistant",
      "content": "muscleGroup",
      "timestamp": "..."
    },
    {
      "role": "user",
      "content": "Mell, Tricepsz",
      "timestamp": "..."
    },
    {
      "role": "assistant",
      "content": "exerciseNumber",
      "timestamp": "..."
    }
  ]
}
```

---

## Common Mistakes

### ❌ Mistake 1: Not Sending Conversation History

```json
{
  "message": "Mell, Tricepsz",
  "conversationHistory": []  // ← WRONG! Empty history
}
```

**Result:** System can't detect training flow

---

### ❌ Mistake 2: Not Including Assistant's Response

```json
{
  "message": "Mell, Tricepsz",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create workout"
    }
    // ← Missing assistant's "muscleGroup" response!
  ]
}
```

**Result:** System can't detect training flow

---

### ❌ Mistake 3: Including Current Message in History

```json
{
  "message": "Mell, Tricepsz",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Create workout"
    },
    {
      "role": "assistant",
      "content": "muscleGroup"
    },
    {
      "role": "user",
      "content": "Mell, Tricepsz"  // ← Don't include current message!
    }
  ]
}
```

**Result:** Last message is user, not assistant - flow detection fails

---

## Frontend Implementation

### Correct Way

```typescript
const [conversationHistory, setConversationHistory] = useState([]);

const sendMessage = async (message: string) => {
  // Send WITHOUT current message in history
  const response = await fetch('/api/fitness/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message,
      conversationHistory: conversationHistory  // ← Previous messages only
    })
  });

  const data = await response.json();
  
  // Update history with response (includes current + bot's response)
  setConversationHistory(data.conversationHistory);
  
  return data;
};
```

---

### Wrong Way

```typescript
const sendMessage = async (message: string) => {
  // ❌ WRONG: Adding current message before sending
  const updatedHistory = [...conversationHistory, {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  }];

  const response = await fetch('/api/fitness/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message,
      conversationHistory: updatedHistory  // ← Wrong! Includes current message
    })
  });
};
```

---

## Debugging Logs

The API now logs these details:

```
message Mell, Tricepsz
conversationHistory length: 2
Last message in history: { role: 'assistant', content: 'muscleGroup', timestamp: '...' }
Last assistant message: { role: 'assistant', content: 'muscleGroup', timestamp: '...' }
Is in training flow? true
```

---

## Check Your Logs

### If You See This:

```
conversationHistory length: 0
Last assistant message: null
Is in training flow? false
```

**Problem:** Frontend is not sending conversation history
**Fix:** Make sure to send `data.conversationHistory` from previous response

---

### If You See This:

```
conversationHistory length: 1
Last message in history: { role: 'user', content: 'Create workout' }
Last assistant message: null
Is in training flow? false
```

**Problem:** Frontend is not including assistant's response
**Fix:** Use the FULL `conversationHistory` from API response, don't manually build it

---

### If You See This:

```
conversationHistory length: 3
Last message in history: { role: 'user', content: 'Mell, Tricepsz' }
Last assistant message: { role: 'assistant', content: 'muscleGroup' }
Is in training flow? true
```

**Result:** ✅ WORKS! (even though current message is in history, it finds assistant message)

---

## Testing Checklist

1. ✅ Send first message: "Create workout"
2. ✅ Receive `responseType: "muscleGroup"`
3. ✅ Save returned `conversationHistory` to state
4. ✅ Send muscle group response with saved `conversationHistory`
5. ✅ Check logs show `Is in training flow? true`
6. ✅ Receive `responseType: "exerciseNumber"`
7. ✅ Send exercise count with updated `conversationHistory`
8. ✅ Receive `category: "training"`

---

## Example Frontend Component

```tsx
import { useState } from 'react';

export default function TrainingChat() {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [message, setMessage] = useState('');

  const sendMessage = async (msg: string) => {
    console.log('Sending message:', msg);
    console.log('With history length:', conversationHistory.length);
    
    const res = await fetch('/api/fitness/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        conversationHistory: conversationHistory  // ← KEY: Send previous history
      })
    });

    const data = await res.json();
    
    console.log('Received responseType:', data.responseType);
    console.log('New history length:', data.conversationHistory.length);
    
    // ← KEY: Update with full history from response
    setConversationHistory(data.conversationHistory);
    
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await sendMessage(message);
    setMessage('');
    
    // Handle response...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

---

## Quick Fix

If training flow is not working:

1. Check browser console or logs for conversation history length
2. Make sure you're saving and sending the FULL `conversationHistory` from previous response
3. Don't manually add messages to history - use what API returns
4. Don't include current message in history when sending

---

## API Contract

**What API Expects:**
```typescript
{
  message: string,              // Current user message
  conversationHistory: Array<{  // Previous messages ONLY
    role: 'user' | 'assistant',
    content: string,
    timestamp: string
  }>
}
```

**What API Returns:**
```typescript
{
  ...
  conversationHistory: Array<{  // Updated with current exchange
    ...previousMessages,
    { role: 'user', content: currentMessage, ... },
    { role: 'assistant', content: botResponse, ... }
  }>
}
```

**Frontend Rule:** Always send the `conversationHistory` you received from the last response!

