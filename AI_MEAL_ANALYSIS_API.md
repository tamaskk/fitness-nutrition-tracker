# AI Meal Analysis API Documentation

Complete guide for analyzing meal images using OpenAI Vision and Firebase Storage.

---

## 🎯 Overview

This API allows you to upload a photo of any meal and receive detailed nutritional analysis including:
- Total calories, protein, carbs, fat, fiber
- Individual ingredient breakdown with weights
- Health score and recommendations
- Allergen warnings
- Meal type classification

**Technology Stack:**
- **Firebase Storage**: Image hosting
- **OpenAI Vision (GPT-4o-mini)**: AI-powered meal analysis
- **Next.js API Route**: Backend endpoint

---

## 📋 Installation

### Required Packages:

```bash
npm install firebase formidable openai
npm install --save-dev @types/formidable
```

### Package Versions:
```json
{
  "firebase": "^10.x.x",
  "formidable": "^3.x.x",
  "openai": "^4.x.x"
}
```

---

## 🔧 Setup

### 1. Environment Variables
Add to your `.env.local`:

```bash
OPENAI_API_KEY=sk-your-openai-api-key
```

### 2. Firebase Configuration
Already configured in `src/lib/firebase.ts` with your credentials.

### 3. Firebase Storage Rules
Make sure your Firebase Storage rules allow authenticated uploads:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /meal-analysis/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📤 API Endpoint

### **POST** `/api/ai-meal-analysis`

Upload a meal image and receive AI-powered nutritional analysis.

---

## 🚀 Usage

### Frontend Request (FormData):

```typescript
const analyzeMeal = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('/api/ai-meal-analysis', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  const data = await response.json();
  return data;
};

// Usage example
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    console.log('Analyzing meal...');
    const result = await analyzeMeal(file);
    console.log('Analysis:', result.analysis);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### React Component Example:

```tsx
import { useState } from 'react';

export default function MealAnalyzer() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/ai-meal-analysis', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Error analyzing meal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleAnalyze}
        disabled={loading}
      />
      
      {loading && <p>Analyzing meal...</p>}
      
      {analysis && (
        <div>
          <h2>{analysis.foodName}</h2>
          <p>{analysis.description}</p>
          
          <h3>Nutrition Facts:</h3>
          <ul>
            <li>Calories: {analysis.totalNutrition.calories} kcal</li>
            <li>Protein: {analysis.totalNutrition.protein}g</li>
            <li>Carbs: {analysis.totalNutrition.carbs}g</li>
            <li>Fat: {analysis.totalNutrition.fat}g</li>
            <li>Fiber: {analysis.totalNutrition.fiber}g</li>
          </ul>
          
          <h3>Ingredients:</h3>
          <ul>
            {analysis.ingredients.map((ing, idx) => (
              <li key={idx}>
                {ing.name} - {ing.estimatedWeight.value}{ing.estimatedWeight.unit}
                ({ing.calories} kcal)
              </li>
            ))}
          </ul>
          
          <p>Health Score: {analysis.healthScore}/10</p>
          <p>{analysis.healthNotes}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📥 API Response

### Success Response (200):

```typescript
{
  "success": true,
  "imageUrl": "https://firebasestorage.googleapis.com/...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "analysis": {
    "foodName": "Sült csirkemell rizzsel és brokkolival",
    "description": "Egészséges, kiegyensúlyozott étrend magas fehérjetartalommal és vitaminokban gazdag zöldségekkel.",
    "estimatedWeight": {
      "value": 450,
      "unit": "g"
    },
    "totalNutrition": {
      "calories": 520,
      "protein": 45,
      "carbs": 48,
      "fat": 12,
      "fiber": 6,
      "sugar": 3
    },
    "ingredients": [
      {
        "name": "Csirkemell",
        "estimatedWeight": {
          "value": 200,
          "unit": "g"
        },
        "calories": 330,
        "protein": 62,
        "carbs": 0,
        "fat": 7
      },
      {
        "name": "Barna rizs",
        "estimatedWeight": {
          "value": 150,
          "unit": "g"
        },
        "calories": 165,
        "protein": 3,
        "carbs": 35,
        "fat": 1
      },
      {
        "name": "Brokkoli",
        "estimatedWeight": {
          "value": 100,
          "unit": "g"
        },
        "calories": 34,
        "protein": 3,
        "carbs": 7,
        "fat": 0
      }
    ],
    "portionSize": "1 adag",
    "healthScore": 9,
    "healthNotes": "Kiváló étkezés! Magas fehérjetartalom, komplex szénhidrátok és vitaminok. Ideális sportolók vagy aktív életmódot folytatók számára.",
    "warnings": [],
    "mealType": "ebéd",
    "confidence": "high"
  }
}
```

### Error Response (400):

```typescript
{
  "error": "No image file provided"
}
```

### Error Response (401):

```typescript
{
  "error": "Unauthorized"
}
```

### Error Response (500):

```typescript
{
  "success": false,
  "error": "Error message details"
}
```

---

## 📊 Response Data Structure

### Analysis Object:

| Field | Type | Description |
|-------|------|-------------|
| `foodName` | string | Name of the meal in Hungarian |
| `description` | string | Brief description (1-2 sentences) |
| `estimatedWeight` | object | Total weight estimate |
| `totalNutrition` | object | Complete nutritional breakdown |
| `ingredients` | array | List of ingredients with individual nutrition |
| `portionSize` | string | Serving size description |
| `healthScore` | number | 1-10 health rating |
| `healthNotes` | string | Health recommendations |
| `warnings` | string[] | Allergen warnings if any |
| `mealType` | string | Meal category |
| `confidence` | string | AI confidence level (high/medium/low) |

### Total Nutrition Fields:

| Field | Type | Unit |
|-------|------|------|
| `calories` | number | kcal |
| `protein` | number | grams |
| `carbs` | number | grams |
| `fat` | number | grams |
| `fiber` | number | grams |
| `sugar` | number | grams |

### Ingredient Object:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Ingredient name |
| `estimatedWeight` | object | Weight estimate with value and unit |
| `calories` | number | Calories from this ingredient |
| `protein` | number | Protein in grams |
| `carbs` | number | Carbs in grams |
| `fat` | number | Fat in grams |

---

## 🎨 Advanced Usage Examples

### Example 1: With Loading State and Preview

```tsx
const [preview, setPreview] = useState<string | null>(null);
const [analysis, setAnalysis] = useState(null);
const [loading, setLoading] = useState(false);

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Show preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setPreview(reader.result as string);
  };
  reader.readAsDataURL(file);

  // Analyze
  analyzeImage(file);
};

const analyzeImage = async (file: File) => {
  setLoading(true);
  
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('/api/ai-meal-analysis', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    
    if (data.success) {
      setAnalysis(data.analysis);
    } else {
      alert('Analysis failed: ' + data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error occurred');
  } finally {
    setLoading(false);
  }
};
```

### Example 2: Save Analysis to Database

```typescript
const saveAnalysis = async (analysis: any, imageUrl: string) => {
  const res = await fetch('/api/meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: analysis.foodName,
      imageUrl,
      calories: analysis.totalNutrition.calories,
      protein: analysis.totalNutrition.protein,
      carbs: analysis.totalNutrition.carbs,
      fat: analysis.totalNutrition.fat,
      ingredients: analysis.ingredients,
      mealType: analysis.mealType,
      date: new Date().toISOString(),
    }),
  });

  return res.json();
};

// Usage after analysis
if (data.success) {
  setAnalysis(data.analysis);
  await saveAnalysis(data.analysis, data.imageUrl);
}
```

### Example 3: Display Nutrition Chart

```tsx
import { Doughnut } from 'react-chartjs-2';

const NutritionChart = ({ nutrition }) => {
  const data = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [{
      data: [
        nutrition.protein * 4,  // Protein: 4 cal/g
        nutrition.carbs * 4,    // Carbs: 4 cal/g
        nutrition.fat * 9,      // Fat: 9 cal/g
      ],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    }],
  };

  return <Doughnut data={data} />;
};
```

---

## ⚡ Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Image Upload to Firebase | ~1-3s | Depends on image size |
| OpenAI Vision Analysis | ~5-15s | Depends on image complexity |
| Total Request Time | ~7-20s | May vary |

**Optimization Tips:**
- Compress images before upload (max 2-3MB recommended)
- Use appropriate image formats (JPEG, PNG, WebP)
- Show loading states to improve UX

---

## 🔒 Security

- ✅ **Authentication Required**: Only authenticated users can use the API
- ✅ **File Size Limit**: Max 10MB per image
- ✅ **File Type Validation**: Only image files accepted
- ✅ **Firebase Storage Rules**: User-specific folders
- ✅ **Temporary File Cleanup**: Files deleted after processing

---

## 🐛 Common Issues

### Issue: "No image file provided"
**Solution**: Make sure you're using `FormData` and appending the file with key `image`:
```typescript
formData.append('image', fileObject);
```

### Issue: "Request timed out"
**Solution**: 
- Reduce image size before upload
- Check Firebase and OpenAI credentials
- Increase timeout in config

### Issue: Low confidence results
**Solution**:
- Use clear, well-lit photos
- Show the entire meal in frame
- Avoid blurry or dark images

---

## 📝 Notes

- **Language**: All analysis is returned in Hungarian
- **Accuracy**: AI estimates may vary ±10-20% from actual values
- **Confidence Levels**:
  - `high`: Clear image, recognizable food
  - `medium`: Partial view or mixed foods
  - `low`: Unclear image or unusual foods
- **Firebase Storage**: Images are permanently stored (implement cleanup if needed)
- **Costs**: OpenAI Vision API charges per image (~$0.01-0.02 per request)

---

## 🎯 Use Cases

1. **Meal Tracking**: Log meals automatically with photos
2. **Calorie Counting**: Get instant nutritional information
3. **Diet Planning**: Analyze meal balance and health
4. **Restaurant Meals**: Estimate nutrition when no info available
5. **Recipe Analysis**: Break down homemade meals
6. **Education**: Learn about food composition

---

## 🚀 Future Enhancements

- [ ] Support for multiple meals in one image
- [ ] Barcode scanning for packaged foods
- [ ] Historical tracking and trends
- [ ] Custom dietary goals comparison
- [ ] Meal recommendations based on goals
- [ ] Export to PDF reports

---

## 📚 Related APIs

- `POST /api/meals` - Save meal to database
- `GET /api/meals` - Get user's meal history
- `POST /api/recipes/generate` - Generate recipes from ingredients

---

**Status**: ✅ Ready to Use  
**Last Updated**: 2024-01-10  
**Version**: 1.0

