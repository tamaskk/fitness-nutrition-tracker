# Barcode API - Quick Reference for Macro Tracking

**TL;DR** - The essential fields you need to display.

---

## 🎯 Must-Have Fields

### **1. Product Identity**
```typescript
product.name           // "BOUNTY 2X28.5g"
product.brand          // "Bounty"
product.imageFront     // Image URL for visual confirmation
```

### **2. Macronutrients (per 100g)** ⭐
```typescript
nutrition.energyKcal       // 487 kcal
nutrition.proteins         // 3.8 g
nutrition.carbohydrates    // 60 g
nutrition.sugars           // 48 g (!!!)
nutrition.fat              // 26 g
nutrition.saturatedFat     // 21 g (!!!)
nutrition.fiber            // 0 g
```

### **3. Serving Size** ⭐
```typescript
product.servingSize        // "57 g"
product.servingQuantity    // 57
```

---

## ⚡ Quick Code

### Calculate for Actual Amount:
```typescript
import { calculateNutritionForAmount } from '@/utils/nutritionCalculator';

// Get from API
const nutritionPer100g = data.product.nutrition;
const servingGrams = data.product.servingQuantity;

// Calculate for 1 serving
const actual = calculateNutritionForAmount(nutritionPer100g, servingGrams);

console.log(actual);
// { calories: 278, protein: 2.2, carbs: 34.2, sugars: 27.4, ... }
```

### Display in UI:
```tsx
<div>
  <img src={product.imageFront} />
  <h2>{product.name}</h2>
  <p>{product.brand}</p>
  
  <h3>Nutrition ({servingGrams}g):</h3>
  <p>Calories: {actual.calories} kcal</p>
  <p>Protein: {actual.protein}g</p>
  <p>Carbs: {actual.carbs}g (sugars: {actual.sugars}g)</p>
  <p>Fat: {actual.fat}g (saturated: {actual.saturatedFat}g)</p>
</div>
```

---

## 🚨 Health Warnings

```typescript
import { getHealthWarnings } from '@/utils/nutritionCalculator';

const warnings = getHealthWarnings(actual);
// ["Very high in sugar (27.4g)", "High in saturated fat (12g)"]

warnings.forEach(w => console.warn(w));
```

---

## 📊 Example: Bounty Bar

**API Call:**
```
GET /api/barcode/product?barcode=5000159558020
```

**Display:**
```
┌───────────────────────────────┐
│ [Bounty Image]               │
│ BOUNTY 2X28.5g               │
│ Bounty                        │
├───────────────────────────────┤
│ For 57g (1 serving):          │
│ • 278 kcal                    │
│ • 2.2g protein                │
│ • 34.2g carbs (27.4g sugar)   │
│ • 14.8g fat (12g saturated)   │
│                               │
│ ⚠️ High sugar                 │
│ ⚠️ High saturated fat         │
└───────────────────────────────┘
```

---

## 🔥 Common Mistakes

❌ **WRONG:** Display nutrition per 100g
```tsx
<p>Calories: {nutrition.energyKcal}</p>  // 487 kcal - confusing!
```

✅ **RIGHT:** Calculate for actual serving
```tsx
<p>Calories: {actual.calories}</p>  // 278 kcal - accurate!
```

---

❌ **WRONG:** Default to 100g
```tsx
const [amount, setAmount] = useState(100);  // Not realistic
```

✅ **RIGHT:** Default to serving size
```tsx
const [amount, setAmount] = useState(servingQuantity);  // 57g
```

---

## 📦 Files You Need

1. **API Endpoint:** `/src/pages/api/barcode/product.ts` ✅ Created
2. **Helper Functions:** `/src/utils/nutritionCalculator.ts` ✅ Created
3. **Complete Guide:** `BARCODE_MACRO_TRACKING_GUIDE.md` ✅ Created
4. **Full API Docs:** `BARCODE_PRODUCT_API_DOCS.md` ✅ Created

---

## 🎯 Remember

1. **Nutrition is per 100g** - Always calculate for actual amount
2. **Use serving size** - Not 100g portions
3. **Show image** - Visual confirmation prevents errors
4. **Warn high sugar/fat** - Help users make better choices
5. **Round numbers** - 1 decimal place is enough

---

**Ready?** Import the helper functions and start building! 🚀


