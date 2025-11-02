# Google Fit Integration Guide

This guide covers the complete setup and usage of Google Fit API integration with NextAuth.js in your fitness tracking application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Google Cloud Console Setup](#google-cloud-console-setup)
4. [Environment Variables](#environment-variables)
5. [API Routes](#api-routes)
6. [Frontend Integration](#frontend-integration)
7. [Available Data Types](#available-data-types)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The application now supports Google Sign-In with access to Google Fit data. This allows users to:

- Sign in with their Google account
- Import fitness data from Google Fit (steps, calories, heart rate, etc.)
- Track activity sessions
- Access historical fitness data

### What's Been Added

- ✅ Google OAuth provider in NextAuth configuration
- ✅ Google Fit API scopes for fitness data access
- ✅ API routes for fetching fitness data
- ✅ TypeScript types for session management
- ✅ Access token management in JWT

---

## Prerequisites

Before you begin, ensure you have:

- A Google Cloud Platform account
- Access to Google Cloud Console
- Your application deployed or running on a public URL (for OAuth callback)

---

## Google Cloud Console Setup

### 1️⃣ Create a New Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name your project (e.g., "Fitness Tracker App")
4. Click **Create**

### 2️⃣ Enable Google Fit API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Fitness API"
3. Click on **Fitness API**
4. Click **Enable**

### 3️⃣ Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace account)
3. Click **Create**

#### Fill in the required fields:

- **App name**: Your app name (e.g., "Fitness Tracker")
- **User support email**: Your email
- **Developer contact information**: Your email

#### Add Scopes:

Click **Add or Remove Scopes** and add these scopes:

```
openid
email
profile
https://www.googleapis.com/auth/fitness.activity.read
https://www.googleapis.com/auth/fitness.heart_rate.read
https://www.googleapis.com/auth/fitness.body.read
https://www.googleapis.com/auth/fitness.nutrition.read
```

#### Add Test Users (for testing):

In the **Test users** section, add your Google account email to test the integration.

### 4️⃣ Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name it (e.g., "Fitness Tracker Web Client")

#### Add Authorized JavaScript origins:

```
http://localhost:3000
https://your-production-domain.com
```

#### Add Authorized redirect URIs:

```
http://localhost:3000/api/auth/callback/google
https://your-production-domain.com/api/auth/callback/google
```

5. Click **Create**
6. **Copy** the **Client ID** and **Client Secret** - you'll need these!

---

## Environment Variables

Add the following to your `.env.local` file (development) and your deployment environment variables (production):

```bash
# Google OAuth & Fit API
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth (if not already set)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

To generate a `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

---

## API Routes

### 1. Fitness Data Endpoint

**Endpoint**: `GET /api/google-fit/data`

Fetches aggregated fitness data from Google Fit.

#### Query Parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dataType` | string | No | `steps` | Type of data to fetch (see [Available Data Types](#available-data-types)) |
| `startDate` | string (ISO) | No | 7 days ago | Start of date range |
| `endDate` | string (ISO) | No | now | End of date range |

#### Example Request:

```typescript
const response = await fetch('/api/google-fit/data?dataType=steps&startDate=2025-10-22T00:00:00Z&endDate=2025-10-29T00:00:00Z');
const data = await response.json();
```

#### Response Format:

```typescript
{
  dataType: "steps",
  startDate: "2025-10-22T00:00:00.000Z",
  endDate: "2025-10-29T00:00:00.000Z",
  buckets: [
    {
      startTime: "2025-10-22T00:00:00.000Z",
      endTime: "2025-10-23T00:00:00.000Z",
      dataset: [
        {
          startTimeNanos: "1729555200000000000",
          endTimeNanos: "1729641599999999999",
          dataTypeName: "com.google.step_count.delta",
          value: [{ intVal: 8542 }]
        }
      ]
    }
    // ... more days
  ],
  raw: { /* full Google Fit API response */ }
}
```

### 2. Activity Sessions Endpoint

**Endpoint**: `GET /api/google-fit/sessions`

Fetches recorded activity sessions from Google Fit.

#### Query Parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | string (ISO) | No | 30 days ago | Start of date range |
| `endDate` | string (ISO) | No | now | End of date range |

#### Example Request:

```typescript
const response = await fetch('/api/google-fit/sessions');
const data = await response.json();
```

#### Response Format:

```typescript
{
  startDate: "2025-09-29T00:00:00.000Z",
  endDate: "2025-10-29T00:00:00.000Z",
  sessions: [
    {
      id: "session-id-123",
      name: "Morning Run",
      description: "5K run in the park",
      activityType: 8, // Running
      application: { /* app info */ },
      startTime: "2025-10-29T06:30:00.000Z",
      endTime: "2025-10-29T07:15:00.000Z",
      modifiedTime: "2025-10-29T07:16:00.000Z",
      activeTimeMillis: 2700000
    }
    // ... more sessions
  ],
  raw: { /* full Google Fit API response */ }
}
```

---

## Frontend Integration

### Sign In with Google

Update your login page or add a Google sign-in button:

```tsx
import { signIn, signOut, useSession } from 'next-auth/react';

export default function LoginPage() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => signIn('google')}>
        Sign in with Google
      </button>
      {/* Your existing credentials login form */}
    </div>
  );
}
```

### Fetch Google Fit Data

Example component to display step count:

```tsx
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function StepCounter() {
  const { data: session } = useSession();
  const [steps, setSteps] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchSteps = async () => {
    if (!session?.accessToken) {
      console.log('No access token available');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/google-fit/data?dataType=steps');
      const data = await response.json();
      
      if (response.ok) {
        // Sum up all steps from the buckets
        const totalSteps = data.buckets.reduce((total: number, bucket: any) => {
          const bucketSteps = bucket.dataset.reduce((sum: number, point: any) => {
            return sum + (point.value?.[0]?.intVal || 0);
          }, 0);
          return total + bucketSteps;
        }, 0);
        
        setSteps(totalSteps);
      } else {
        console.error('Error fetching steps:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Your Steps (Last 7 Days)</h2>
      {session?.accessToken ? (
        <>
          <button onClick={fetchSteps} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Steps'}
          </button>
          {steps > 0 && <p>Total steps: {steps.toLocaleString()}</p>}
        </>
      ) : (
        <p>Sign in with Google to view your step count</p>
      )}
    </div>
  );
}
```

### Display Activity Sessions

```tsx
import { useState } from 'react';

export default function ActivitySessions() {
  const [sessions, setSessions] = useState([]);

  const fetchSessions = async () => {
    const response = await fetch('/api/google-fit/sessions');
    const data = await response.json();
    
    if (response.ok) {
      setSessions(data.sessions);
    }
  };

  return (
    <div>
      <h2>Your Activity Sessions</h2>
      <button onClick={fetchSessions}>Fetch Sessions</button>
      
      {sessions.length > 0 && (
        <ul>
          {sessions.map((session: any) => (
            <li key={session.id}>
              <strong>{session.name}</strong>
              <p>{new Date(session.startTime).toLocaleString()}</p>
              <p>Duration: {Math.round(session.activeTimeMillis / 60000)} minutes</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Available Data Types

The `/api/google-fit/data` endpoint supports the following data types:

| Data Type | Description | Value Type |
|-----------|-------------|------------|
| `steps` | Step count | Integer |
| `calories` | Calories expended | Float |
| `heart_rate` | Heart rate (BPM) | Float |
| `distance` | Distance traveled (meters) | Float |
| `weight` | Body weight (kg) | Float |
| `sleep` | Sleep segments | Duration |
| `active_minutes` | Active minutes | Integer |
| `speed` | Movement speed (m/s) | Float |

### Usage Example:

```typescript
// Fetch heart rate data
const response = await fetch('/api/google-fit/data?dataType=heart_rate&startDate=2025-10-28T00:00:00Z');

// Fetch calories burned
const response = await fetch('/api/google-fit/data?dataType=calories');

// Fetch distance traveled
const response = await fetch('/api/google-fit/data?dataType=distance');
```

---

## Troubleshooting

### Common Issues

#### 1. "Not authenticated" Error

**Problem**: API returns 401 with "Not authenticated with Google"

**Solution**:
- Ensure the user signed in with Google (not credentials)
- Check that `session.accessToken` exists
- Verify OAuth scopes are correctly configured

#### 2. "Access blocked" During Login

**Problem**: Google shows "This app isn't verified"

**Solution**:
- During development, add yourself as a test user in Google Cloud Console
- For production, submit your app for verification
- Users can click "Advanced" → "Go to [Your App]" to proceed (not recommended for production)

#### 3. Redirect URI Mismatch

**Problem**: OAuth error about redirect URI

**Solution**:
- Verify your redirect URIs in Google Cloud Console match exactly:
  - Development: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://yourdomain.com/api/auth/callback/google`
- Check `NEXTAUTH_URL` environment variable matches your domain

#### 4. No Data Returned

**Problem**: API returns empty data

**Solution**:
- Ensure the user has Google Fit data in the requested date range
- Verify the user granted all requested permissions during sign-in
- Try a different data type (some users may not have all data types)
- Check if the user has a fitness tracking device connected to Google Fit

#### 5. Token Expired Error

**Problem**: 401 error "Google authentication expired"

**Solution**:
- User needs to sign out and sign in again to refresh the token
- Consider implementing refresh token logic for long-lived sessions

### Debugging Tips

1. **Check Session Data**:

```typescript
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
console.log('Session:', session);
console.log('Access Token:', session?.accessToken ? 'Present' : 'Missing');
```

2. **View Raw API Response**:

The API routes return a `raw` field with the full Google Fit API response for debugging.

3. **Enable Debug Logs**:

Add `debug: true` to your NextAuth configuration:

```typescript
export const authOptions: NextAuthOptions = {
  debug: true, // Enable detailed logs
  // ... rest of config
};
```

4. **Test API Directly**:

Use the [Google Fit REST API Explorer](https://developers.google.com/fit/rest) to test API calls independently.

---

## Google Fit Activity Types

Common activity type IDs used in sessions:

| ID | Activity |
|----|----------|
| 0 | In vehicle |
| 1 | Biking |
| 7 | Walking |
| 8 | Running |
| 9 | Aerobics |
| 10 | Badminton |
| 11 | Baseball |
| 12 | Basketball |
| 13 | Biathlon |
| 15 | Dancing |
| 19 | Fencing |
| 26 | Hiking |
| 58 | Swimming |
| 73 | Yoga |

Full list: [Google Fit Activity Types](https://developers.google.com/fit/rest/v1/reference/activity-types)

---

## Security Best Practices

1. **Never expose access tokens** to the client-side code beyond what's in the session
2. **Always validate** the session on API routes before making Google Fit requests
3. **Keep secrets secure** - never commit `.env` files to version control
4. **Use HTTPS** in production for all OAuth flows
5. **Regularly rotate** your `NEXTAUTH_SECRET`
6. **Request minimal scopes** - only ask for permissions your app actually needs
7. **Handle token expiration** gracefully with proper error messages

---

## Additional Resources

- [Google Fit REST API Documentation](https://developers.google.com/fit/rest)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Fit API Scopes](https://developers.google.com/fit/rest/v1/authorization)

---

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Review the server logs for API errors
3. Verify all environment variables are set correctly
4. Ensure Google Cloud Console configuration matches this guide
5. Test with a fresh user account that has Google Fit data

---

**Last Updated**: October 29, 2025

