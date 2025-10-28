# 🚀 Strava OAuth 2.0 Setup Guide

## ✅ What's Changed

I've upgraded the Strava integration to use **proper OAuth 2.0 flow**! Now users just click a button and login through Strava's official page - no more manual token entry!

---

## 📋 Setup Steps

### 1. Create a Strava App

1. Go to **https://www.strava.com/settings/api**
2. Click **"Create an App"** or **"My API Application"**
3. Fill in the form:
   - **Application Name**: Your App Name (e.g., "Fitness Tracker")
   - **Category**: Choose appropriate category
   - **Club**: Leave empty (optional)
   - **Website**: Your website URL (e.g., `http://localhost:3000`)
   - **Authorization Callback Domain**: `localhost` (for development) or `your-domain.com` (for production)
   - **Application Description**: Brief description of your app
4. Click **"Create"**

### 2. Get Your Credentials

After creating the app, you'll see:
- **Client ID**: A number (e.g., `12345`)
- **Client Secret**: A long string (keep this SECRET!)

### 3. Add Environment Variables

Add these to your `.env.local` file:

```bash
# Strava OAuth Configuration
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here

# Your app URL (required for OAuth redirect)
NEXTAUTH_URL=http://localhost:3000
```

**For production:**
```bash
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=https://your-domain.com
```

### 4. Update Authorization Callback Domain

**Important:** The callback domain must match your environment:

**Development:**
- Authorization Callback Domain: `localhost`
- Redirect URI will be: `http://localhost:3000/api/strava/oauth/callback`

**Production:**
- Authorization Callback Domain: `your-domain.com`
- Redirect URI will be: `https://your-domain.com/api/strava/oauth/callback`

---

## 🎯 How It Works Now

### User Flow

1. **User clicks "Connect with Strava"** on profile page
2. **Redirects to Strava's login page** (official Strava page)
3. **User logs in with Strava account** (if not already logged in)
4. **Strava shows permission request**:
   - Read your profile
   - Read your activities
   - Access all your activities
5. **User clicks "Authorize"**
6. **Strava redirects back to your app** with authorization code
7. **Your app exchanges code for access token** (automatic, server-side)
8. **Token saved to database** (secure, encrypted recommended)
9. **User redirected to profile page** with success message

### Technical Flow

```
User → Click "Connect"
  ↓
GET /api/strava/oauth/authorize
  ↓
Redirect to: https://www.strava.com/oauth/authorize?client_id=...&redirect_uri=...
  ↓
User authorizes on Strava
  ↓
Strava redirects to: /api/strava/oauth/callback?code=XXXXX
  ↓
Server exchanges code for tokens
  ↓
POST https://www.strava.com/oauth/token
  ↓
Receive: access_token, refresh_token, athlete data
  ↓
Save to database
  ↓
Redirect to: /profile?strava_success=true
  ↓
Show success message ✅
```

---

## 📁 New Files Created

### 1. `/src/pages/api/strava/oauth/authorize.ts`
- Initiates OAuth flow
- Redirects user to Strava authorization page
- Includes required scopes: `read,activity:read_all,profile:read_all`

### 2. `/src/pages/api/strava/oauth/callback.ts`
- Handles OAuth callback from Strava
- Exchanges authorization code for access token
- Saves tokens and athlete data to database
- Redirects user back to profile page

### 3. Updated: `/src/pages/profile.tsx`
- Removed manual token input modal
- "Connect with Strava" button now redirects to OAuth flow
- Shows success/error messages after OAuth redirect
- Cleaner, more professional UX

---

## 🔐 Security Benefits

### Why OAuth is Better

✅ **No manual token handling** - Users never see or copy tokens
✅ **Standard flow** - Uses official OAuth 2.0 protocol
✅ **Refresh tokens** - Automatically refresh expired tokens
✅ **Revocable** - Users can revoke access from Strava settings
✅ **Secure** - Tokens never exposed to frontend
✅ **Professional** - Same flow as Nike Run Club, Runkeeper, etc.

---

## 🧪 Testing

### 1. Start Your Dev Server
```bash
npm run dev
```

### 2. Go to Profile Page
```
http://localhost:3000/profile
```

### 3. Click "Connect with Strava"
You should be redirected to Strava's authorization page

### 4. Login & Authorize
- Login with your Strava account
- Click "Authorize"
- You'll be redirected back to your profile

### 5. Check Connection
You should see:
- ✅ Green success message
- ✅ Green checkmark on Strava section
- ✅ Connection info displayed

---

## 🚨 Troubleshooting

### Error: "Strava Client ID not configured"
**Solution:** Add `STRAVA_CLIENT_ID` to your `.env.local` file

### Error: "Callback domain mismatch"
**Solution:** 
1. Check your Strava app settings
2. Ensure "Authorization Callback Domain" matches your domain
3. For localhost, use just `localhost` (no port, no http://)

### Error: "Failed to exchange authorization code"
**Solution:**
1. Check `STRAVA_CLIENT_SECRET` is correct
2. Ensure it's in your `.env.local` file
3. Restart your dev server after adding env variables

### Redirect Loop
**Solution:**
1. Clear browser cookies
2. Check `NEXTAUTH_URL` matches your current environment
3. Ensure no typos in redirect URI

---

## 🎨 UI Changes

### Before (Manual Token)
```
[Connect with Strava] → Modal opens
  ↓
User enters long token manually
  ↓
Click "Connect"
```

### After (OAuth Flow)
```
[Connect with Strava] → Strava login page opens
  ↓
User logs in on Strava
  ↓
Automatic redirect back
  ↓
Connected! ✅
```

---

## 📊 What Data We Request

### Scopes Requested
- **`read`**: Basic read access
- **`activity:read_all`**: Read all activities (public + private)
- **`profile:read_all`**: Read full profile info

### Data Received
- Access token (for API calls)
- Refresh token (for token renewal)
- Athlete ID
- Username
- Basic profile info

---

## 🔄 Token Refresh (Future Enhancement)

Strava access tokens expire after 6 hours. To handle this:

```typescript
// Example refresh token logic (not yet implemented)
async function refreshStravaToken(refreshToken: string) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  
  const { access_token, refresh_token } = await response.json();
  // Save new tokens to database
}
```

---

## 📝 Environment Variables Summary

```bash
# Required for Strava OAuth
STRAVA_CLIENT_ID=12345                        # Get from Strava app settings
STRAVA_CLIENT_SECRET=abc123def456...          # Keep SECRET!
NEXTAUTH_URL=http://localhost:3000            # Your app URL

# Optional (already exists)
MONGODB_URI=...                               # Your database
NEXTAUTH_SECRET=...                           # For session encryption
```

---

## ✅ Checklist

Before testing:
- [ ] Created Strava app at https://www.strava.com/settings/api
- [ ] Added `STRAVA_CLIENT_ID` to `.env.local`
- [ ] Added `STRAVA_CLIENT_SECRET` to `.env.local`
- [ ] Set `NEXTAUTH_URL` in `.env.local`
- [ ] Set Authorization Callback Domain to `localhost` (or your domain)
- [ ] Restarted dev server
- [ ] Cleared browser cache/cookies

---

## 🎉 Result

Now your app has **professional OAuth integration** just like:
- Strava ↔️ Apple Health
- Strava ↔️ Garmin Connect
- Strava ↔️ Nike Run Club
- etc.

Users simply click "Connect with Strava" and everything is handled automatically through Strava's official authorization flow!

---

**Last Updated**: 2024-10-28  
**Status**: ✅ Ready to Use (after environment setup)

