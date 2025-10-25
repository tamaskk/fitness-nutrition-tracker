# Barcode API - Essential Data for Macro Tracking

Quick reference guide for the **most important** fields when building a macro tracking app.

---

## 🎯 High Priority (Core Data)

These are the **essential fields** you MUST display for effective macro tracking:

---

## 1️⃣ Product Identification

### **Fields:**
```typescript
product.name      // "BOUNTY 2X28.5g"
product.brand     // "Bounty"
product.imageFront // Image URL
```

### **Why Important:**
- Users need to visually confirm they scanned the right product
- Prevents logging mistakes

### **Usage Example:**
```tsx
<div className="product-header">
  <img src={data.product.imageFront} alt={data.product.name} />
  <div>
    <h2>{data.product.name}</h2>
    <p className="brand">{data.product.brand}</p>
  </div>
</div>
```

---

## 2️⃣ Macronutrients (Per 100g) ⭐ CRITICAL

### **Fields:**
```typescript
nutrition.energyKcal    // 487 kcal
nutrition.carbohydrates // 60 g
nutrition.sugars        // 48 g (of which sugars)
nutrition.fat           // 26 g
nutrition.saturatedFat  // 21 g (of which saturated)
nutrition.proteins      // 3.8 g
nutrition.fiber         // 0 g
```

### **⚠️ IMPORTANT:**
These values are **per 100g/100ml**, NOT per serving!

### **Why Important:**
- Foundation of macro tracking
- High sugar (48g) and saturated fat (21g) are health red flags
- Allows calculating actual consumption

### **Display Example:**
```tsx
<div className="nutrition-grid">
  <div className="macro-item">
    <span className="label">Calories</span>
    <span className="value">{nutrition.energyKcal}</span>
    <span className="unit">kcal/100g</span>
  </div>
  
  <div className="macro-item">
    <span className="label">Protein</span>
    <span className="value">{nutrition.proteins}</span>
    <span className="unit">g</span>
  </div>
  
  <div className="macro-item">
    <span className="label">Carbs</span>
    <span className="value">{nutrition.carbohydrates}</span>
    <span className="unit">g</span>
    <div className="sub-value">of which sugars: {nutrition.sugars}g</div>
  </div>
  
  <div className="macro-item">
    <span className="label">Fat</span>
    <span className="value">{nutrition.fat}</span>
    <span className="unit">g</span>
    <div className="sub-value">of which saturated: {nutrition.saturatedFat}g</div>
  </div>
  
  <div className="macro-item">
    <span className="label">Fiber</span>
    <span className="value">{nutrition.fiber}</span>
    <span className="unit">g</span>
  </div>
</div>
```

---

## 3️⃣ Serving Size Information ⭐ CRITICAL

### **Fields:**
```typescript
product.servingSize     // "57 g"
product.servingQuantity // 57
```

### **Why Important:**
- Users rarely eat exactly 100g
- Allows accurate portion logging
- Example: "Log 1 serving (57g)" vs "Log 150g"

### **Usage Example:**
```tsx
<div className="serving-selector">
  <label>Amount consumed:</label>
  <select onChange={handleServingChange}>
    <option value="1">1 serving ({servingQuantity}g)</option>
    <option value="0.5">½ serving ({servingQuantity / 2}g)</option>
    <option value="2">2 servings ({servingQuantity * 2}g)</option>
    <option value="custom">Custom amount</option>
  </select>
</div>
```

---

## 📊 Calculate Actual Nutrition for Serving

### **Helper Functions:**

```typescript
/**
 * Calculate nutrition for a specific amount
 * @param nutritionPer100g - Nutrition data from API (per 100g)
 * @param amountGrams - Actual amount consumed in grams
 * @returns Nutrition for the specified amount
 */
export const calculateNutritionForAmount = (
  nutritionPer100g: {
    energyKcal: number;
    carbohydrates: number;
    sugars: number;
    fat: number;
    saturatedFat: number;
    proteins: number;
    fiber: number;
  },
  amountGrams: number
) => {
  const factor = amountGrams / 100;

  return {
    calories: Math.round(nutritionPer100g.energyKcal * factor),
    protein: Math.round(nutritionPer100g.proteins * factor * 10) / 10,
    carbs: Math.round(nutritionPer100g.carbohydrates * factor * 10) / 10,
    sugars: Math.round(nutritionPer100g.sugars * factor * 10) / 10,
    fat: Math.round(nutritionPer100g.fat * factor * 10) / 10,
    saturatedFat: Math.round(nutritionPer100g.saturatedFat * factor * 10) / 10,
    fiber: Math.round(nutritionPer100g.fiber * factor * 10) / 10,
  };
};

// Usage Example:
const bountyNutritionPer100g = {
  energyKcal: 487,
  carbohydrates: 60,
  sugars: 48,
  fat: 26,
  saturatedFat: 21,
  proteins: 3.8,
  fiber: 0
};

// Calculate for 1 serving (57g)
const oneServing = calculateNutritionForAmount(bountyNutritionPer100g, 57);
console.log(oneServing);
// Result:
// {
//   calories: 278,
//   protein: 2.2,
//   carbs: 34.2,
//   sugars: 27.4,
//   fat: 14.8,
//   saturatedFat: 12.0,
//   fiber: 0
// }

// Calculate for 150g
const customAmount = calculateNutritionForAmount(bountyNutritionPer100g, 150);
console.log(customAmount);
// Result: { calories: 731, protein: 5.7, carbs: 90, ... }
```

---

## 🎨 Complete UI Component Example

```tsx
import { useState } from 'react';

interface ProductData {
  product: {
    name: string;
    brand: string;
    imageFront: string;
    servingSize: string;
    servingQuantity: number;
    nutrition: {
      energyKcal: number;
      proteins: number;
      carbohydrates: number;
      sugars: number;
      fat: number;
      saturatedFat: number;
      fiber: number;
    };
  };
}

export default function ProductMacroCard({ data }: { data: ProductData }) {
  const [amount, setAmount] = useState(data.product.servingQuantity);
  
  // Calculate nutrition for current amount
  const actualNutrition = calculateNutritionForAmount(
    data.product.nutrition,
    amount
  );

  return (
    <div className="product-card">
      {/* Product Identity */}
      <div className="product-header">
        <img 
          src={data.product.imageFront} 
          alt={data.product.name}
          className="product-image"
        />
        <div className="product-info">
          <h2>{data.product.name}</h2>
          <p className="brand">{data.product.brand}</p>
        </div>
      </div>

      {/* Serving Selector */}
      <div className="serving-selector">
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="1"
        />
        <span>grams</span>
        
        <div className="quick-options">
          <button onClick={() => setAmount(data.product.servingQuantity)}>
            1 serving ({data.product.servingQuantity}g)
          </button>
          <button onClick={() => setAmount(data.product.servingQuantity / 2)}>
            ½ serving
          </button>
          <button onClick={() => setAmount(data.product.servingQuantity * 2)}>
            2 servings
          </button>
        </div>
      </div>

      {/* Nutrition Display */}
      <div className="nutrition-panel">
        <h3>Nutrition for {amount}g:</h3>
        
        <div className="macro-grid">
          {/* Calories - Big and prominent */}
          <div className="macro-item calories">
            <span className="value">{actualNutrition.calories}</span>
            <span className="label">Calories</span>
          </div>

          {/* Macros */}
          <div className="macro-item">
            <span className="value">{actualNutrition.protein}g</span>
            <span className="label">Protein</span>
          </div>

          <div className="macro-item">
            <span className="value">{actualNutrition.carbs}g</span>
            <span className="label">Carbs</span>
            <span className="sub">{actualNutrition.sugars}g sugars</span>
          </div>

          <div className="macro-item">
            <span className="value">{actualNutrition.fat}g</span>
            <span className="label">Fat</span>
            <span className="sub">{actualNutrition.saturatedFat}g saturated</span>
          </div>

          <div className="macro-item">
            <span className="value">{actualNutrition.fiber}g</span>
            <span className="label">Fiber</span>
          </div>
        </div>

        {/* Health Warnings */}
        {actualNutrition.sugars > 20 && (
          <div className="warning">
            ⚠️ High in sugar ({actualNutrition.sugars}g)
          </div>
        )}
        
        {actualNutrition.saturatedFat > 10 && (
          <div className="warning">
            ⚠️ High in saturated fat ({actualNutrition.saturatedFat}g)
          </div>
        )}
      </div>

      {/* Action Button */}
      <button 
        className="add-to-diary"
        onClick={() => logFood(data, amount, actualNutrition)}
      >
        Add to Food Diary
      </button>
    </div>
  );
}

// Helper to log food
const logFood = async (data: ProductData, amount: number, nutrition: any) => {
  await fetch('/api/meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productName: data.product.name,
      brand: data.product.brand,
      barcode: data.barcode,
      amountGrams: amount,
      nutrition: nutrition,
      timestamp: new Date().toISOString(),
    })
  });
};
```

---

## 🔥 Real Example: Bounty Bar

### **API Response:**
```json
{
  "product": {
    "name": "BOUNTY 2X28.5g",
    "brand": "Bounty",
    "imageFront": "https://images.openfoodfacts.org/.../front_hu.19.400.jpg",
    "servingSize": "57 g",
    "servingQuantity": 57,
    "nutrition": {
      "energyKcal": 487,
      "proteins": 3.8,
      "carbohydrates": 60,
      "sugars": 48,
      "fat": 26,
      "saturatedFat": 21,
      "fiber": 0
    }
  }
}
```

### **What User Sees:**

```
┌──────────────────────────────────┐
│ [Image] BOUNTY 2X28.5g          │
│         Bounty                   │
├──────────────────────────────────┤
│ Amount: [57▼] grams             │
│ [1 serving] [½ serving] [2x]    │
├──────────────────────────────────┤
│ Nutrition for 57g:               │
│                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │278 │ │2.2g│ │34.2g│ │14.8g│  │
│  │kcal│ │Pro.│ │Carbs│ │Fat │  │
│  └────┘ └────┘ └────┘ └────┘   │
│         27.4g sugars             │
│         12.0g saturated          │
│                                  │
│  ⚠️ High in sugar (27.4g)       │
│  ⚠️ High in saturated fat (12g) │
├──────────────────────────────────┤
│   [Add to Food Diary] ✓          │
└──────────────────────────────────┘
```

---

## 📈 Macro Tracking Flow

```
1. Scan Barcode
   ↓
2. Fetch Product Data
   ↓
3. Display:
   - Product Image (visual confirmation)
   - Name & Brand
   - Serving size options
   ↓
4. User Selects Amount
   ↓
5. Calculate Actual Nutrition
   (per 100g × amount / 100)
   ↓
6. Display Calculated Macros
   - Calories (prominent)
   - Protein, Carbs, Fat
   - Sugars, Saturated Fat (sub-values)
   - Health warnings if needed
   ↓
7. Log to Diary
   - Save to database
   - Update daily totals
   - Show in meal log
```

---

## ✅ Implementation Checklist

- [ ] Display product image for visual confirmation
- [ ] Show product name and brand prominently
- [ ] Display serving size and allow custom amounts
- [ ] Calculate nutrition based on actual amount
- [ ] Show all macros (protein, carbs, fat)
- [ ] Highlight sugars and saturated fat as sub-values
- [ ] Add health warnings for high sugar/saturated fat
- [ ] Allow logging with calculated values
- [ ] Save to database with timestamp
- [ ] Update daily macro totals

---

## 🎯 Key Takeaways

1. **Always use `servingQuantity`** - Users don't eat 100g portions
2. **Calculate actual nutrition** - Multiply per-100g values by (amount/100)
3. **Show sub-values** - Sugars and saturated fat are important health indicators
4. **Visual confirmation** - Image helps prevent logging errors
5. **Health warnings** - Alert users to high sugar/fat content

---

## 💡 Pro Tips

### **Tip 1: Smart Defaults**
Default to the serving size, not 100g:
```typescript
const [amount, setAmount] = useState(product.servingQuantity); // 57g, not 100g
```

### **Tip 2: Portion Helpers**
Provide common portions:
```typescript
<button onClick={() => setAmount(servingQuantity * 0.5)}>½ serving</button>
<button onClick={() => setAmount(servingQuantity * 1)}>1 serving</button>
<button onClick={() => setAmount(servingQuantity * 2)}>2 servings</button>
```

### **Tip 3: Health Scoring**
Add visual indicators:
```typescript
const getHealthColor = (sugars: number) => {
  if (sugars < 5) return 'green';    // Low sugar
  if (sugars < 15) return 'yellow';  // Medium sugar
  return 'red';                       // High sugar
};
```

### **Tip 4: Daily Tracking**
Sum up all logged foods:
```typescript
const dailyTotals = {
  calories: meals.reduce((sum, m) => sum + m.nutrition.calories, 0),
  protein: meals.reduce((sum, m) => sum + m.nutrition.protein, 0),
  carbs: meals.reduce((sum, m) => sum + m.nutrition.carbs, 0),
  fat: meals.reduce((sum, m) => sum + m.nutrition.fat, 0),
};
```

---

**Ready to build your macro tracker!** 🚀

Focus on these essential fields first, then add more features later.


