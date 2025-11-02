# Google Fit Integration - Quick Start

## 🚀 Quick Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=run-openssl-rand-base64-32
```

### 2. Google Cloud Console (5 minutes)

1. **Create Project**: https://console.cloud.google.com/
2. **Enable Fitness API**: APIs & Services → Library → Search "Fitness API" → Enable
3. **OAuth Consent**: APIs & Services → OAuth consent screen → Add scopes:
   - `fitness.activity.read`
   - `fitness.heart_rate.read`
   - `fitness.body.read`
   - `fitness.nutrition.read`
4. **Create Credentials**: APIs & Services → Credentials → Create OAuth client ID
   - Type: Web application
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Test Sign-In

```tsx
import { signIn, useSession } from 'next-auth/react';

// In your component:
const { data: session } = useSession();

<button onClick={() => signIn('google')}>
  Sign in with Google
</button>
```

---

## 📊 API Endpoints

### Get Fitness Data

```typescript
GET /api/google-fit/data?dataType=steps&startDate=2025-10-22T00:00:00Z

// Available data types:
// steps, calories, heart_rate, distance, weight, sleep, active_minutes, speed
```

### Get Activity Sessions

```typescript
GET /api/google-fit/sessions?startDate=2025-10-01T00:00:00Z
```

---

## 💡 Quick Examples

### Fetch Steps

```tsx
const fetchSteps = async () => {
  const res = await fetch('/api/google-fit/data?dataType=steps');
  const data = await res.json();
  
  const total = data.buckets.reduce((sum, bucket) => 
    sum + bucket.dataset.reduce((s, point) => 
      s + (point.value?.[0]?.intVal || 0), 0), 0
  );
  
  console.log('Total steps:', total);
};
```

### Fetch Heart Rate

```tsx
const fetchHeartRate = async () => {
  const res = await fetch('/api/google-fit/data?dataType=heart_rate');
  const data = await res.json();
  console.log('Heart rate data:', data.buckets);
};
```

### Fetch Activities

```tsx
const fetchActivities = async () => {
  const res = await fetch('/api/google-fit/sessions');
  const data = await res.json();
  console.log('Activities:', data.sessions);
};
```

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Not authenticated" | User must sign in with Google (not credentials) |
| "This app isn't verified" | Add yourself as test user in Google Cloud Console |
| Redirect URI mismatch | Check URIs match exactly in Google Console |
| No data returned | User needs Google Fit data for the date range |

---

## 🔗 Full Documentation

See [GOOGLE_FIT_INTEGRATION.md](./GOOGLE_FIT_INTEGRATION.md) for complete setup guide, troubleshooting, and advanced usage.

---

## 📱 What's Already Configured

✅ NextAuth with Google provider  
✅ Google Fit API scopes  
✅ TypeScript types for session  
✅ API routes for fitness data  
✅ Access token management  

**You just need to**:
1. Set up Google Cloud Console
2. Add environment variables
3. Start using the API endpoints!

