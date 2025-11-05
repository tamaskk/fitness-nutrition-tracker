# Classification Rules Update

## Problem Fixed

**Issue:** Questions like "Milyen pihenőnapokat javasolsz?" (What rest days do you recommend?) were incorrectly classified as `training` instead of `general`.

**Root Cause:** The classification was too broad - any fitness-related question was marked as "training".

---

## New Classification Logic

### Clear Distinctions

| Category | Intent | Examples |
|----------|--------|----------|
| **training** | User wants to **GET/CREATE** a workout plan or routine | "Create a workout plan", "Give me a training routine", "Show me exercises for chest" |
| **recipe** | User wants to **MAKE/COOK** a specific dish | "How to cook chicken?", "Give me a recipe for pasta", "Cooking instructions for salmon" |
| **finance** | User wants to **TRACK/MANAGE** money | "Track my expenses", "How much did I spend?", "Add expense" |
| **shopping_list** | User wants to **CREATE/MANAGE** a list | "Add to shopping list", "What should I buy?", "Show my list" |
| **general** | User wants **ADVICE/GUIDANCE/EXPLANATION** | All other questions, advice requests, recommendations, "how-to" questions |

---

## Key Rule Changes

### Training vs General

| Message | Old Classification | New Classification | Why |
|---------|-------------------|-------------------|-----|
| "Create workout plan" | `training` ✓ | `training` ✓ | Wants a plan |
| "I want to build muscle" | `training` ❌ | `general` ✓ | Asking for advice |
| "What rest days?" | `training` ❌ | `general` ✓ | Asking for guidance |
| "How often should I train?" | `training` ❌ | `general` ✓ | Asking for recommendation |
| "Should I do cardio?" | `training` ❌ | `general` ✓ | Asking for advice |
| "Give me a 5-day split" | `training` ✓ | `training` ✓ | Wants a plan |

### Recipe vs General

| Message | Old Classification | New Classification | Why |
|---------|-------------------|-------------------|-----|
| "Give me a recipe" | `recipe` ✓ | `recipe` ✓ | Wants recipe |
| "How to cook salmon?" | `recipe` ✓ | `recipe` ✓ | Wants cooking instructions |
| "What should I eat?" | `recipe` ❌ | `general` ✓ | Nutrition advice |
| "Is salmon good?" | `recipe` ❌ | `general` ✓ | Nutrition question |
| "Best protein foods?" | `recipe` ❌ | `general` ✓ | Nutrition advice |

---

## Examples (Before vs After)

### Example 1: Rest Day Question

**Message:** "Milyen pihenőnapokat javasolsz?" (What rest days do you recommend?)

**Before:**
```json
{
  "category": "training",  // ❌ Wrong
  "response": "training"
}
```

**After:**
```json
{
  "category": "general",  // ✓ Correct
  "response": "For optimal recovery, I recommend..."  // Full AI answer
}
```

---

### Example 2: Muscle Building

**Message:** "I want to build muscle"

**Before:**
```json
{
  "category": "training",  // ❌ Wrong (too broad)
  "response": "training"
}
```

**After:**
```json
{
  "category": "general",  // ✓ Correct
  "response": "Great goal! To build muscle effectively, you need..."  // Full AI answer
}
```

---

### Example 3: Specific Workout Request

**Message:** "Create a 3-day workout plan for me"

**Before:**
```json
{
  "category": "training",  // ✓ Correct
  "response": "training"
}
```

**After:**
```json
{
  "category": "training",  // ✓ Still correct
  "response": "training"
}
```

---

## When to Use Each Category

### Use `training` ONLY when:
- ✅ "Create a workout"
- ✅ "Give me a training plan"
- ✅ "Show me exercises for X"
- ✅ "What workout should I do?"
- ✅ "Design a program for me"

### Use `general` for:
- ✅ "How often should I train?"
- ✅ "What rest days do you recommend?"
- ✅ "Should I do cardio or weights?"
- ✅ "I want to build muscle" (advice request)
- ✅ "How do I improve my fitness?"
- ✅ "What's better for weight loss?"
- ✅ "Tips for recovery?"

### Use `recipe` ONLY when:
- ✅ "Give me a recipe for X"
- ✅ "How to cook X?"
- ✅ "How do I make X?"
- ✅ "Cooking instructions for X"

### Use `general` for nutrition:
- ✅ "What should I eat?"
- ✅ "Best foods for protein?"
- ✅ "How many calories?"
- ✅ "Is X healthy?"
- ✅ "Nutrition advice"

### Use `finance` ONLY when:
- ✅ "Track my expenses"
- ✅ "How much did I spend?"
- ✅ "Add expense"
- ✅ "Show my budget"

### Use `general` for money advice:
- ✅ "How should I budget?"
- ✅ "Tips for saving money"
- ✅ "How much should I spend on food?"

### Use `shopping_list` ONLY when:
- ✅ "Add X to shopping list"
- ✅ "What's on my list?"
- ✅ "Create shopping list"
- ✅ "Remove X from list"

### Use `general` for shopping advice:
- ✅ "What should I buy for meal prep?" (advice)
- ✅ "Best grocery stores?"
- ✅ "Tips for grocery shopping"

---

## Summary

**The Rule:** If the user wants to **CREATE, GET, VIEW, or MANAGE** something specific → Use specific category

**Otherwise:** If they're asking for **ADVICE, GUIDANCE, RECOMMENDATIONS** → Use `general`

---

## Impact

✅ **More Accurate:** Questions like "What rest days?" now get full AI answers

✅ **Better UX:** Users get help when they need it, redirects when they want actions

✅ **Clearer Intent:** System now distinguishes between wanting a plan vs wanting advice

✅ **Language Support:** Works in any language (Hungarian example included)

---

## Testing

Test these messages to verify correct classification:

| Message | Expected Category |
|---------|------------------|
| "Milyen pihenőnapokat javasolsz?" | `general` ✓ |
| "How often should I train?" | `general` ✓ |
| "Create a workout plan" | `training` ✓ |
| "I want to build muscle" | `general` ✓ |
| "What should I eat?" | `general` ✓ |
| "Give me a chicken recipe" | `recipe` ✓ |
| "How to cook salmon?" | `recipe` ✓ |
| "Track my expenses" | `finance` ✓ |
| "Add milk to list" | `shopping_list` ✓ |
| "Hello" | `general` ✓ |

---

## Developer Notes

- Classification happens in `src/pages/api/fitness/chat.ts`
- Updated `CLASSIFICATION_PROMPT` with clearer rules
- Added 15+ examples to train the AI classifier
- Included specific Hungarian example
- Temperature set to 0.3 for consistent classification

