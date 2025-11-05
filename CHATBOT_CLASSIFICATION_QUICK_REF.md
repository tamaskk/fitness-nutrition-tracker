# Chatbot Classification - Quick Reference

## How It Works

**Every message is analyzed and categorized first:**

```
User Message → Classification → Response
```

---

## Categories & Responses

| Category | When Detected | What You Get |
|----------|---------------|--------------|
| `training` | User wants to CREATE/GET a workout plan/routine | Just the text: `"training"` |
| `recipe` | User wants to MAKE/COOK a specific recipe | Just the text: `"recipe"` |
| `finance` | User wants to TRACK/MANAGE money/expenses | Just the text: `"finance"` |
| `shopping_list` | User wants to CREATE/MANAGE shopping list | Just the text: `"shopping_list"` |
| `general` | Advice, recommendations, guidance, "how-to" questions | **Full AI response** |

---

## Quick Examples

### Specific Categories (Short Response)

```javascript
// Request
{ "message": "I want to build muscle" }

// Response
{
  "success": true,
  "category": "training",
  "response": "training",  // ← Just the category name
  ...
}
```

### General Questions (Full Response)

```javascript
// Request
{ "message": "How many calories should I eat?" }

// Response
{
  "success": true,
  "category": "general",
  "response": "Based on your profile, I recommend...",  // ← Full AI answer
  ...
}
```

---

## What to Do with Each Category

```typescript
if (data.category === 'training') {
  // → Redirect to training/workout section
  router.push('/training');
}
else if (data.category === 'recipe') {
  // → Redirect to recipes section
  router.push('/recipes');
}
else if (data.category === 'finance') {
  // → Redirect to finance section
  router.push('/finance');
}
else if (data.category === 'shopping_list') {
  // → Redirect to shopping list
  router.push('/shopping');
}
else if (data.category === 'general') {
  // → Display AI response in chat
  showChatMessage(data.response);
}
```

---

## Classification Examples

| User Says | Category | Action |
|-----------|----------|--------|
| "Create workout plan" | `training` | → /training |
| "I want to build muscle" | `general` | Show AI response |
| "What rest days do you recommend?" | `general` | Show AI response |
| "Give me a recipe for chicken" | `recipe` | → /recipes |
| "What should I eat for protein?" | `general` | Show AI response |
| "Track my expenses" | `finance` | → /finance |
| "How much should I budget?" | `general` | Show AI response |
| "Add milk to shopping list" | `shopping_list` | → /shopping |
| "How many calories?" | `general` | Show AI response |
| "Hello" | `general` | Show AI response |
| "I need motivation" | `general` | Show AI response |

---

## Response Structure

### For Specific Categories
```json
{
  "success": true,
  "category": "training",      // ← Category name
  "response": "training",       // ← Same as category
  "conversationHistory": [...],
  "timestamp": "...",
  "messageCount": 2
}
```

### For General
```json
{
  "success": true,
  "category": "general",             // ← Always "general"
  "response": "Full AI answer...",   // ← Detailed response
  "conversationHistory": [...],
  "timestamp": "...",
  "messageCount": 2
}
```

---

## Simple Integration

```typescript
const handleMessage = async (message: string) => {
  const res = await fetch('/api/fitness/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const data = await res.json();
  
  // Check category and act
  switch (data.category) {
    case 'training':
      navigateToTraining();
      break;
    case 'recipe':
      navigateToRecipes();
      break;
    case 'finance':
      navigateToFinance();
      break;
    case 'shopping_list':
      navigateToShopping();
      break;
    case 'general':
      displayInChat(data.response);
      break;
  }
};
```

---

## Key Points

✅ **Always check `category` field** in response

✅ **Specific categories** → Redirect to that section

✅ **General category** → Show AI response in chat

✅ **Still maintain** `conversationHistory` for all types

✅ **Category detection** is automatic - no extra work needed

---

For detailed docs: See `FITNESS_CHATBOT_WITH_CLASSIFICATION.md`

