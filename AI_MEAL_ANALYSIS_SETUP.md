# AI Meal Analysis - Quick Setup Guide

Complete setup instructions for the AI Meal Analysis feature.

---

## 📦 Step 1: Install Required Packages

Run this command in your project root:

```bash
npm install firebase formidable openai
npm install --save-dev @types/formidable
```

**Package Purposes:**
- `firebase`: For Firebase Storage (image hosting)
- `formidable`: For handling file uploads in Next.js
- `openai`: For OpenAI Vision API (meal analysis)

---

## 🔑 Step 2: Environment Variables

Add to your `.env.local` file:

```bash
# OpenAI API Key (required for vision analysis)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Firebase is configured in code, no env vars needed
```

**Get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and paste into `.env.local`

---

## 🔥 Step 3: Firebase Setup

### Already Configured! ✅
Firebase configuration is already set up in `src/lib/firebase.ts` with your credentials.

### Optional: Set Storage Rules
Go to Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /meal-analysis/{userId}/{fileName} {
      allow read: if true;  // Public read
      allow write: if request.auth != null;  // Authenticated write
    }
  }
}
```

---

## ✅ Step 4: Verify Installation

Create a test file to verify everything works:

**Create: `src/pages/test-meal-analysis.tsx`**

```tsx
import { useState } from 'react';

export default function TestMealAnalysis() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/ai-meal-analysis', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResult(data);
        console.log('✅ Success!', data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🍽️ Test AI Meal Analysis</h1>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={loading}
        style={{ marginBottom: '20px' }}
      />

      {loading && <p>⏳ Analyzing meal... (this may take 10-20 seconds)</p>}
      
      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#fee' }}>
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
          <h2>✅ Analysis Complete!</h2>
          
          <img 
            src={result.imageUrl} 
            alt="Meal" 
            style={{ maxWidth: '300px', borderRadius: '8px', marginBottom: '20px' }}
          />

          <h3>{result.analysis.foodName}</h3>
          <p>{result.analysis.description}</p>

          <div style={{ background: 'white', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
            <h4>📊 Nutrition Facts:</h4>
            <ul>
              <li><strong>Calories:</strong> {result.analysis.totalNutrition.calories} kcal</li>
              <li><strong>Protein:</strong> {result.analysis.totalNutrition.protein}g</li>
              <li><strong>Carbs:</strong> {result.analysis.totalNutrition.carbs}g</li>
              <li><strong>Fat:</strong> {result.analysis.totalNutrition.fat}g</li>
              <li><strong>Fiber:</strong> {result.analysis.totalNutrition.fiber}g</li>
            </ul>
          </div>

          <div style={{ background: 'white', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
            <h4>🥗 Ingredients:</h4>
            <ul>
              {result.analysis.ingredients.map((ing: any, idx: number) => (
                <li key={idx}>
                  <strong>{ing.name}:</strong> {ing.estimatedWeight.value}{ing.estimatedWeight.unit}
                  ({ing.calories} kcal)
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'white', padding: '15px', borderRadius: '5px' }}>
            <p><strong>Health Score:</strong> {result.analysis.healthScore}/10</p>
            <p><strong>Notes:</strong> {result.analysis.healthNotes}</p>
            <p><strong>Meal Type:</strong> {result.analysis.mealType}</p>
            <p><strong>Confidence:</strong> {result.analysis.confidence}</p>
          </div>

          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer' }}>View Full JSON Response</summary>
            <pre style={{ background: '#333', color: '#0f0', padding: '10px', overflow: 'auto' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Step 5: Test the API

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:**
   ```
   http://localhost:3000/test-meal-analysis
   ```

3. **Upload a meal photo** and wait 10-20 seconds

4. **Check results:**
   - ✅ See nutritional breakdown
   - ✅ View ingredients list
   - ✅ Check health score
   - ✅ Verify Firebase URL

---

## 📝 Step 6: Check Console Logs

Watch your terminal for progress:

```bash
📷 Image received: meal.jpg 2456789 bytes
☁️ Uploading to Firebase: meal-analysis/user_email/1234567890_meal.jpg
✅ Firebase URL: https://firebasestorage.googleapis.com/...
🤖 Analyzing with OpenAI Vision...
✅ OpenAI analysis complete
```

---

## 🔧 Troubleshooting

### Error: "Module not found: Can't resolve 'firebase'"
**Solution:**
```bash
npm install firebase
```

### Error: "Module not found: Can't resolve 'formidable'"
**Solution:**
```bash
npm install formidable
npm install --save-dev @types/formidable
```

### Error: "OPENAI_API_KEY is not set"
**Solution:**
1. Create `.env.local` in project root
2. Add: `OPENAI_API_KEY=sk-your-key`
3. Restart dev server

### Error: "Firebase: Error (auth/invalid-api-key)"
**Solution:**
Firebase config is already set up correctly. If you see this error, check that you're not importing analytics in server-side code.

### Error: "Request timeout"
**Solution:**
- Image too large - compress before upload
- Slow internet - wait longer
- OpenAI API issues - check status at status.openai.com

---

## 📊 Expected Costs

### OpenAI API Costs:
- **GPT-4o-mini with Vision**: ~$0.01-0.02 per image
- **Monthly estimate** (100 images): ~$1-2

### Firebase Storage Costs:
- **Storage**: 5GB free, then $0.026/GB
- **Downloads**: 1GB free, then $0.12/GB
- **Typical usage** (1000 images): ~$0.50/month

**Total estimated cost for 100 analyses/month: ~$1.50-2.50** 💰

---

## ✅ Verification Checklist

- [ ] `npm install` completed successfully
- [ ] `.env.local` has `OPENAI_API_KEY`
- [ ] Dev server starts without errors
- [ ] Test page loads at `/test-meal-analysis`
- [ ] Can upload image
- [ ] Image appears in Firebase Storage
- [ ] Analysis returns with nutrition data
- [ ] No errors in console

---

## 🎉 You're Ready!

The AI Meal Analysis API is now set up and ready to use!

**Next Steps:**
1. Read `AI_MEAL_ANALYSIS_API.md` for complete API documentation
2. Integrate into your meal tracking features
3. Add to your recipe or nutrition pages
4. Build awesome food analysis features! 🚀

**Need Help?**
- Check the full docs: `AI_MEAL_ANALYSIS_API.md`
- Review example code in this guide
- Test with the `/test-meal-analysis` page

---

**Setup Time**: ~5 minutes  
**Difficulty**: Easy ⭐⭐☆☆☆  
**Status**: ✅ Ready to Use

