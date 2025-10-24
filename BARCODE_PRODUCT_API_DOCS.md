# Barcode Product Lookup API Documentation

Complete guide for looking up product information using barcodes with Open Food Facts.

---

## 🎯 Overview

This API allows you to scan a barcode (EAN-13, UPC, etc.) and get detailed product information including:
- Product name, brand, quantity
- Complete nutritional information (per 100g)
- Ingredients list
- Allergens and traces
- Nutri-Score (A-E health rating)
- Images
- Eco-Score (environmental impact)

**Data Source:** [Open Food Facts](https://world.openfoodfacts.org/) - Free, open database with millions of products worldwide.

---

## 📡 API Endpoint

### **GET** `/api/barcode/product`

Fetch product information by barcode.

---

## 📤 Request

### **Method:** GET

### **Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `barcode` | string | ✅ Yes | The product barcode (EAN-13, UPC-A, etc.) |

### **Headers:**
```
Authorization: Bearer <your-token>
// or use session authentication
```

### **Example Requests:**

#### JavaScript/TypeScript:
```typescript
// Fetch product by barcode
const fetchProduct = async (barcode: string) => {
  const response = await fetch(`/api/barcode/product?barcode=${barcode}`);
  
  if (!response.ok) {
    throw new Error('Product not found');
  }
  
  const data = await response.json();
  return data;
};

// Usage
const product = await fetchProduct('5997205721234');
console.log(product.product.name);
console.log(product.product.nutrition);
```

#### cURL:
```bash
curl "http://localhost:3000/api/barcode/product?barcode=5997205721234" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### URL Examples:
```
GET /api/barcode/product?barcode=5997205721234
GET /api/barcode/product?barcode=3017620422003
GET /api/barcode/product?barcode=737628064502
```

---

## 📥 Response

### **Success Response (200):**

```typescript
{
  "success": true,
  "barcode": "5997205721234",
  "product": {
    // ===== BASIC INFO =====
    "name": "Hell Energy Drink",
    "brand": "Hell Energy",
    "quantity": "250 ml",
    "categories": ["Beverages", "Carbonated drinks", "Energy drinks"],
    
    // ===== IMAGES =====
    "image": "https://images.openfoodfacts.org/images/products/599/720/572/1234/front_en.jpg",
    "imageSmall": "https://images.openfoodfacts.org/images/products/599/720/572/1234/front_en.200.jpg",
    "imageFront": "https://images.openfoodfacts.org/images/products/599/720/572/1234/front_en.400.jpg",
    
    // ===== NUTRITION (per 100g or 100ml) =====
    "nutrition": {
      "energyKcal": 45,        // Calories in kcal
      "energyKj": 190,         // Calories in kJ
      "fat": 0,                // Fat in grams
      "saturatedFat": 0,       // Saturated fat in grams
      "carbohydrates": 11,     // Carbs in grams
      "sugars": 11,            // Sugar in grams
      "fiber": 0,              // Fiber in grams
      "proteins": 0,           // Protein in grams
      "salt": 0.2,             // Salt in grams
      "sodium": 0.08           // Sodium in grams
    },
    
    // ===== HEALTH SCORES =====
    "nutriScore": "D",         // Nutri-Score grade (A=best, E=worst)
    "nutriScoreScore": 10,     // Nutri-Score numeric value
    
    // ===== INGREDIENTS =====
    "ingredients": "Water, sugar, carbon dioxide, taurine (0.4%), acidity regulator...",
    "ingredientsList": [
      {
        "id": "en:water",
        "text": "water",
        "percent_estimate": 85,
        "percent_max": 100,
        "percent_min": 85
      },
      {
        "id": "en:sugar",
        "text": "sugar",
        "percent_estimate": 11,
        "percent_max": 15,
        "percent_min": 7
      }
      // ... more ingredients
    ],
    
    // ===== ALLERGENS =====
    "allergens": [],                    // Empty if no allergens
    "allergensText": "N/A",            // Human-readable allergen text
    
    // ===== TRACES =====
    "traces": [],                       // May contain traces of...
    "tracesText": "N/A",
    
    // ===== LABELS =====
    "labels": ["en:no-preservatives"],  // Special labels (bio, vegan, etc.)
    "labelsText": "No preservatives",
    
    // ===== SERVING INFO =====
    "servingSize": "250 ml",
    "servingQuantity": 250,
    
    // ===== ADDITIONAL INFO =====
    "countries": ["en:hungary"],
    "stores": "Tesco, Aldi, Lidl",
    "packaging": "Can",
    "origin": "Hungary",
    
    // ===== PROCESSING LEVEL =====
    "novaGroup": 4,                     // 1=unprocessed, 4=ultra-processed
    
    // ===== ENVIRONMENTAL IMPACT =====
    "ecoScore": "D",                    // Eco-Score grade (A=best, E=worst)
    "ecoScoreScore": 35                 // Eco-Score numeric value
  },
  
  // ===== RAW DATA (full response from Open Food Facts) =====
  "raw": { /* complete product object */ },
  
  // ===== SOURCE INFORMATION =====
  "source": {
    "api": "Open Food Facts",
    "url": "https://world.openfoodfacts.org/product/5997205721234",
    "lastModified": "2024-01-10T15:30:00.000Z"
  }
}
```

---

## 📊 Response Data Explanation

### **Basic Info:**
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Product name (in Hungarian if available) |
| `brand` | string | Brand/manufacturer name |
| `quantity` | string | Package size (e.g., "500 ml", "200 g") |
| `categories` | string[] | Product categories |

### **Nutrition (per 100g/100ml):**
| Field | Unit | Description |
|-------|------|-------------|
| `energyKcal` | kcal | Calories (kilocalories) |
| `energyKj` | kJ | Calories (kilojoules) |
| `fat` | g | Total fat |
| `saturatedFat` | g | Saturated fat |
| `carbohydrates` | g | Total carbohydrates |
| `sugars` | g | Sugars |
| `fiber` | g | Dietary fiber |
| `proteins` | g | Protein |
| `salt` | g | Salt |
| `sodium` | g | Sodium |

### **Health Scores:**

#### **Nutri-Score:**
- **A** 🟢 = Best nutritional quality
- **B** 🟢 = Good
- **C** 🟡 = Average
- **D** 🟠 = Poor
- **E** 🔴 = Worst

#### **Nova Group (Processing Level):**
- **1** = Unprocessed/minimally processed
- **2** = Processed culinary ingredients
- **3** = Processed foods
- **4** = Ultra-processed foods

#### **Eco-Score (Environmental Impact):**
- **A** 🟢 = Very low impact
- **B** 🟢 = Low impact
- **C** 🟡 = Medium impact
- **D** 🟠 = High impact
- **E** 🔴 = Very high impact

---

## ❌ Error Responses

### **400 - Bad Request (Missing Barcode):**
```json
{
  "error": "Barcode is required",
  "message": "Please provide a barcode as a query parameter: ?barcode=1234567890"
}
```

### **401 - Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

### **404 - Product Not Found:**
```json
{
  "success": false,
  "message": "Product not found",
  "barcode": "9999999999999",
  "hint": "This barcode is not in the Open Food Facts database"
}
```

### **500 - Internal Server Error:**
```json
{
  "success": false,
  "error": "Open Food Facts API error: 503"
}
```

---

## 💡 Usage Examples

### **Example 1: Display Product Card**

```tsx
import { useState } from 'react';

interface ProductData {
  success: boolean;
  product: {
    name: string;
    brand: string;
    image: string;
    nutrition: {
      energyKcal: number;
      proteins: number;
      carbohydrates: number;
      fat: number;
    };
    nutriScore: string;
  };
}

export default function ProductCard({ barcode }: { barcode: string }) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/barcode/product?barcode=${barcode}`);
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <button onClick={fetchProduct}>Scan Product</button>;

  return (
    <div className="product-card">
      <img src={product.product.image} alt={product.product.name} />
      <h2>{product.product.name}</h2>
      <p>{product.product.brand}</p>
      
      <div className="nutri-score">
        Nutri-Score: {product.product.nutriScore}
      </div>
      
      <div className="nutrition">
        <p>Calories: {product.product.nutrition.energyKcal} kcal</p>
        <p>Protein: {product.product.nutrition.proteins}g</p>
        <p>Carbs: {product.product.nutrition.carbohydrates}g</p>
        <p>Fat: {product.product.nutrition.fat}g</p>
      </div>
    </div>
  );
}
```

### **Example 2: Calculate Nutrition for Serving**

```typescript
const calculateServingNutrition = (product: ProductData, servingGrams: number) => {
  const factor = servingGrams / 100; // Nutrition is per 100g
  
  return {
    calories: Math.round(product.product.nutrition.energyKcal * factor),
    protein: Math.round(product.product.nutrition.proteins * factor * 10) / 10,
    carbs: Math.round(product.product.nutrition.carbohydrates * factor * 10) / 10,
    fat: Math.round(product.product.nutrition.fat * factor * 10) / 10,
  };
};

// Usage: Calculate nutrition for 250ml serving
const serving = calculateServingNutrition(productData, 250);
console.log(`This 250ml serving has ${serving.calories} calories`);
```

### **Example 3: Check for Allergens**

```typescript
const checkAllergens = (product: ProductData, userAllergens: string[]) => {
  const productAllergens = product.product.allergens.map(a => a.replace('en:', ''));
  const found = userAllergens.filter(allergen => 
    productAllergens.some(pa => pa.includes(allergen.toLowerCase()))
  );
  
  return {
    hasAllergens: found.length > 0,
    allergens: found
  };
};

// Usage
const check = checkAllergens(productData, ['milk', 'eggs', 'peanuts']);
if (check.hasAllergens) {
  alert(`Warning! Contains: ${check.allergens.join(', ')}`);
}
```

### **Example 4: Barcode Scanner Integration**

```tsx
import { useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function BarcodeScanner() {
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState(null);

  const startScanning = async () => {
    const codeReader = new BrowserMultiFormatReader();
    
    try {
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, 'video');
      const scannedBarcode = result.getText();
      setBarcode(scannedBarcode);
      
      // Fetch product info
      const res = await fetch(`/api/barcode/product?barcode=${scannedBarcode}`);
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error('Scanning error:', error);
    }
  };

  return (
    <div>
      <video id="video" width="300" height="200"></video>
      <button onClick={startScanning}>Start Scanning</button>
      {product && <ProductDisplay product={product} />}
    </div>
  );
}
```

---

## 🔍 Common Barcodes for Testing

| Barcode | Product | Country |
|---------|---------|---------|
| `3017620422003` | Nutella | France |
| `5449000000996` | Coca-Cola | International |
| `8076809513746` | Barilla Pasta | Italy |
| `40111001` | Diet Coke | USA |
| `5997205721234` | Hell Energy | Hungary |

Try these in your app to test!

---

## 🌍 Language Support

Open Food Facts returns product names in multiple languages:
- `product_name_hu` - Hungarian
- `product_name_en` - English
- `product_name` - Default language

The API automatically selects the best available name.

---

## 📝 Important Notes

### **What This API Does:**
✅ Fetches product data from Open Food Facts  
✅ Returns structured nutritional information  
✅ Includes images, allergens, scores  
✅ Free to use (Open Food Facts is free)  

### **What's in the Body:**
**NOTHING! This is a GET request.**
- ❌ No request body
- ✅ Data goes in URL query parameters: `?barcode=12345`

### **Authentication:**
- Currently requires authentication (token or session)
- You can remove the auth check if you want it public

### **Data Accuracy:**
- Data comes from Open Food Facts (community-maintained)
- ~90% of products in Europe are available
- Some products may have incomplete data
- Always check if fields exist before using them

### **Performance:**
- Typical response time: 200-500ms
- No rate limiting on Open Food Facts
- Consider caching frequently accessed products

---

## 🚀 Next Steps

1. **Scan Barcodes**: Use a barcode scanner library (ZXing, Quagga, etc.)
2. **Save to Database**: Store scanned products in your MongoDB
3. **Track Consumption**: Log when users consume products
4. **Calculate Totals**: Sum up daily nutritional intake
5. **Set Goals**: Compare consumption vs. daily targets

---

## 🔗 Related APIs

- `/api/barcode/scan` - Camera-based barcode scanning
- `/api/meals` - Save meal with scanned products
- `/api/ai-meal-analysis` - AI-powered meal analysis

---

**API Status**: ✅ Ready to Use  
**Data Source**: Open Food Facts (free, open data)  
**Rate Limit**: None  
**Authentication**: Required (can be disabled)

