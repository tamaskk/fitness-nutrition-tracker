# Food Text Analysis API

## Overview
This API endpoint analyzes food descriptions using AI to estimate nutritional content including calories, macros, and micros.

## Endpoint
```
POST /api/food/analyze-text
```

## Authentication
Requires authentication via:
- NextAuth session (web)
- JWT token in Authorization header (mobile)

## Request

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token> (for mobile)
```

### Body
```json
{
  "text": "2 slices of pizza and a coke"
}
```

### Parameters
| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| text      | string | Yes      | Food description (max 500 characters)         |

---

## Response Examples

### Example 1: Simple Meal
**Request:**
```json
{
  "text": "2 slices of pizza and a coke"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "analysis": {
    "description": "2 slices of cheese pizza and 1 can of regular Coke",
    "items": [
      {
        "name": "Cheese Pizza",
        "quantity": "2 slices (approx 250g)",
        "calories": 570,
        "macros": {
          "protein": 24.0,
          "carbs": 68.0,
          "fat": 22.0,
          "fiber": 4.0
        },
        "micros": {
          "vitaminA": 180.0,
          "vitaminC": 2.5,
          "vitaminD": 0.5,
          "calcium": 350.0,
          "iron": 3.2,
          "sodium": 1200.0,
          "potassium": 280.0
        }
      },
      {
        "name": "Coca-Cola",
        "quantity": "1 can (330ml)",
        "calories": 140,
        "macros": {
          "protein": 0.0,
          "carbs": 39.0,
          "fat": 0.0,
          "fiber": 0.0
        },
        "micros": {
          "vitaminA": 0.0,
          "vitaminC": 0.0,
          "vitaminD": 0.0,
          "calcium": 0.0,
          "iron": 0.1,
          "sodium": 45.0,
          "potassium": 0.0
        }
      }
    ],
    "totals": {
      "calories": 710,
      "macros": {
        "protein": 24.0,
        "carbs": 107.0,
        "fat": 22.0,
        "fiber": 4.0
      },
      "micros": {
        "vitaminA": 180.0,
        "vitaminC": 2.5,
        "vitaminD": 0.5,
        "calcium": 350.0,
        "iron": 3.3,
        "sodium": 1245.0,
        "potassium": 280.0
      }
    },
    "notes": [
      "High in sodium (52% of daily value)",
      "High in carbohydrates",
      "Moderate protein content",
      "Consider pairing with vegetables for better nutrition balance"
    ]
  },
  "originalText": "2 slices of pizza and a coke",
  "analyzedAt": "2025-11-02T19:00:00.000Z"
}
```

---

### Example 2: Healthy Meal
**Request:**
```json
{
  "text": "grilled chicken breast 200g with brown rice and steamed broccoli"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "analysis": {
    "description": "200g grilled chicken breast with approximately 150g brown rice and 100g steamed broccoli",
    "items": [
      {
        "name": "Grilled Chicken Breast",
        "quantity": "200g",
        "calories": 330,
        "macros": {
          "protein": 62.0,
          "carbs": 0.0,
          "fat": 7.0,
          "fiber": 0.0
        },
        "micros": {
          "vitaminA": 20.0,
          "vitaminC": 0.0,
          "vitaminD": 0.2,
          "calcium": 15.0,
          "iron": 1.2,
          "sodium": 140.0,
          "potassium": 520.0
        }
      },
      {
        "name": "Brown Rice",
        "quantity": "150g cooked (approx 1 cup)",
        "calories": 165,
        "macros": {
          "protein": 3.5,
          "carbs": 35.0,
          "fat": 1.5,
          "fiber": 2.0
        },
        "micros": {
          "vitaminA": 0.0,
          "vitaminC": 0.0,
          "vitaminD": 0.0,
          "calcium": 10.0,
          "iron": 0.8,
          "sodium": 5.0,
          "potassium": 80.0
        }
      },
      {
        "name": "Steamed Broccoli",
        "quantity": "100g (approx 1 cup)",
        "calories": 35,
        "macros": {
          "protein": 2.4,
          "carbs": 7.0,
          "fat": 0.4,
          "fiber": 2.6
        },
        "micros": {
          "vitaminA": 623.0,
          "vitaminC": 89.2,
          "vitaminD": 0.0,
          "calcium": 47.0,
          "iron": 0.7,
          "sodium": 33.0,
          "potassium": 316.0
        }
      }
    ],
    "totals": {
      "calories": 530,
      "macros": {
        "protein": 67.9,
        "carbs": 42.0,
        "fat": 8.9,
        "fiber": 4.6
      },
      "micros": {
        "vitaminA": 643.0,
        "vitaminC": 89.2,
        "vitaminD": 0.2,
        "calcium": 72.0,
        "iron": 2.7,
        "sodium": 178.0,
        "potassium": 916.0
      }
    },
    "notes": [
      "Excellent high-protein meal",
      "Low in fat and sodium",
      "Rich in Vitamin A and Vitamin C from broccoli",
      "Well-balanced macros for muscle building or weight loss",
      "Good source of fiber"
    ]
  },
  "originalText": "grilled chicken breast 200g with brown rice and steamed broccoli",
  "analyzedAt": "2025-11-02T19:05:00.000Z"
}
```

---

### Example 3: Snack
**Request:**
```json
{
  "text": "banana and peanut butter"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "analysis": {
    "description": "1 medium banana with approximately 2 tablespoons of peanut butter",
    "items": [
      {
        "name": "Banana",
        "quantity": "1 medium (118g)",
        "calories": 105,
        "macros": {
          "protein": 1.3,
          "carbs": 27.0,
          "fat": 0.4,
          "fiber": 3.1
        },
        "micros": {
          "vitaminA": 76.0,
          "vitaminC": 10.3,
          "vitaminD": 0.0,
          "calcium": 6.0,
          "iron": 0.3,
          "sodium": 1.0,
          "potassium": 422.0
        }
      },
      {
        "name": "Peanut Butter",
        "quantity": "2 tablespoons (32g)",
        "calories": 190,
        "macros": {
          "protein": 8.0,
          "carbs": 7.0,
          "fat": 16.0,
          "fiber": 2.0
        },
        "micros": {
          "vitaminA": 0.0,
          "vitaminC": 0.0,
          "vitaminD": 0.0,
          "calcium": 16.0,
          "iron": 0.6,
          "sodium": 140.0,
          "potassium": 208.0
        }
      }
    ],
    "totals": {
      "calories": 295,
      "macros": {
        "protein": 9.3,
        "carbs": 34.0,
        "fat": 16.4,
        "fiber": 5.1
      },
      "micros": {
        "vitaminA": 76.0,
        "vitaminC": 10.3,
        "vitaminD": 0.0,
        "calcium": 22.0,
        "iron": 0.9,
        "sodium": 141.0,
        "potassium": 630.0
      }
    },
    "notes": [
      "Good pre or post-workout snack",
      "High in healthy fats",
      "Excellent source of potassium",
      "Good fiber content"
    ]
  },
  "originalText": "banana and peanut butter",
  "analyzedAt": "2025-11-02T19:10:00.000Z"
}
```

---

### Example 4: Vague Description
**Request:**
```json
{
  "text": "some pasta"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "analysis": {
    "description": "Approximately 1 cup (140g) of cooked pasta with basic tomato sauce",
    "items": [
      {
        "name": "Cooked Pasta",
        "quantity": "1 cup (140g)",
        "calories": 220,
        "macros": {
          "protein": 8.0,
          "carbs": 43.0,
          "fat": 1.3,
          "fiber": 2.5
        },
        "micros": {
          "vitaminA": 0.0,
          "vitaminC": 0.0,
          "vitaminD": 0.0,
          "calcium": 10.0,
          "iron": 1.8,
          "sodium": 1.0,
          "potassium": 62.0
        }
      }
    ],
    "totals": {
      "calories": 220,
      "macros": {
        "protein": 8.0,
        "carbs": 43.0,
        "fat": 1.3,
        "fiber": 2.5
      },
      "micros": {
        "vitaminA": 0.0,
        "vitaminC": 0.0,
        "vitaminD": 0.0,
        "calcium": 10.0,
        "iron": 1.8,
        "sodium": 1.0,
        "potassium": 62.0
      }
    },
    "notes": [
      "Estimate based on plain cooked pasta",
      "Actual nutrition may vary based on sauce, toppings, and portion size",
      "Consider adding protein and vegetables for a more complete meal"
    ]
  },
  "originalText": "some pasta",
  "analyzedAt": "2025-11-02T19:15:00.000Z"
}
```

---

## Error Responses

### 400 - Missing Text
```json
{
  "message": "Please provide a food description text",
  "success": false
}
```

### 400 - Text Too Long
```json
{
  "message": "Text description is too long. Please keep it under 500 characters.",
  "success": false
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

### 500 - Server Error
```json
{
  "success": false,
  "message": "Failed to analyze food text",
  "error": "Error details"
}
```

### 504 - Timeout
```json
{
  "success": false,
  "message": "Analysis timed out. Please try again."
}
```

---

## Usage Tips

1. **Be specific**: More detailed descriptions lead to better estimates
   - Good: "200g grilled salmon with lemon"
   - Vague: "fish"

2. **Include quantities**: Specify amounts when possible
   - Good: "2 eggs and 3 slices of bacon"
   - Vague: "eggs and bacon"

3. **Cooking methods matter**: Include how food is prepared
   - Good: "fried chicken"
   - Less specific: "chicken"

4. **Multiple items**: You can list multiple foods in one request
   - "breakfast: 2 eggs, toast with butter, orange juice"

5. **Text length**: Keep descriptions under 500 characters

---

## Response Structure

### Main Response Object
| Field        | Type   | Description                                    |
|-------------|--------|------------------------------------------------|
| success     | boolean| Whether the analysis was successful            |
| analysis    | object | Detailed nutritional analysis                  |
| originalText| string | The input text that was analyzed               |
| analyzedAt  | string | ISO timestamp of when analysis was performed   |

### Analysis Object
| Field       | Type   | Description                                    |
|------------|--------|------------------------------------------------|
| description| string | Summary of what was analyzed                   |
| items      | array  | Individual food items with their nutrition     |
| totals     | object | Combined totals of all items                   |
| notes      | array  | Additional insights and recommendations        |

### Item Object
| Field    | Type   | Description                                    |
|----------|--------|------------------------------------------------|
| name     | string | Name of the food item                          |
| quantity | string | Estimated or specified quantity                |
| calories | number | Calories (kcal)                                |
| macros   | object | Macronutrients (protein, carbs, fat, fiber)    |
| micros   | object | Micronutrients (vitamins and minerals)         |

### Macros Object (values in grams)
- `protein`: Protein content
- `carbs`: Carbohydrate content
- `fat`: Fat content
- `fiber`: Fiber content

### Micros Object
- `vitaminA`: Vitamin A (mcg)
- `vitaminC`: Vitamin C (mg)
- `vitaminD`: Vitamin D (mcg)
- `calcium`: Calcium (mg)
- `iron`: Iron (mg)
- `sodium`: Sodium (mg)
- `potassium`: Potassium (mg)

---

## Integration Example

### JavaScript/TypeScript
```typescript
const analyzeFood = async (foodText: string) => {
  const response = await fetch('/api/food/analyze-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: foodText }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Total Calories:', data.analysis.totals.calories);
    console.log('Protein:', data.analysis.totals.macros.protein, 'g');
    console.log('Carbs:', data.analysis.totals.macros.carbs, 'g');
    console.log('Fat:', data.analysis.totals.macros.fat, 'g');
  } else {
    console.error('Analysis failed:', data.message);
  }
  
  return data;
};

// Usage
analyzeFood("2 eggs and bacon").then(result => {
  // Handle result
});
```

### cURL
```bash
curl -X POST https://your-domain.com/api/food/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"text": "grilled chicken salad with olive oil dressing"}'
```

---

## Notes

- The AI provides **estimates** based on typical serving sizes and nutritional data
- Actual nutritional content may vary based on:
  - Specific brands
  - Cooking methods
  - Actual portion sizes
  - Recipe variations
- Use these estimates as a guide, not as exact measurements
- For precise tracking, weigh foods and use specific product information when available

