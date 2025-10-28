# 🚀 Strava OAuth - Quick Start (5 Minutes)

## ✅ What Changed

**Before:** Manual token entry (complicated)  
**Now:** Click button → Strava login → Done! (just like other apps)

---

## 🔧 Setup (Do This Once)

### Step 1: Create Strava App (2 minutes)
1. Go to: **https://www.strava.com/settings/api**
2. Click **"Create an App"**
3. Fill in:
   - **Application Name**: "Your App Name"
   - **Website**: `http://localhost:3000`
   - **Authorization Callback Domain**: `localhost`
4. Click **"Create"**
5. Copy your **Client ID** and **Client Secret**

### Step 2: Add to .env.local (1 minute)
Create or edit `.env.local` in your project root:

```bash
STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=abc123def456ghi789
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Restart Server
```bash
npm run dev
```

---

## 🎯 How to Use

1. **Go to profile page**: `http://localhost:3000/profile`
2. **Scroll to "Strava Integration"** section (right sidebar)
3. **Click "Connect with Strava"** (orange button)
4. **Login to Strava** (if not already logged in)
5. **Click "Authorize"**
6. **Done!** ✅ You're redirected back with success message

---

## 📁 New Files

- `/src/pages/api/strava/oauth/authorize.ts` - Starts OAuth flow
- `/src/pages/api/strava/oauth/callback.ts` - Handles OAuth response
- Updated `/src/pages/profile.tsx` - Removed token input modal

---

## 🎨 User Experience

### Old Way (Manual)
```
Click "Connect" 
  → Modal opens
  → User copies long token from Strava
  → Pastes into input field
  → Click "Connect"
  → Done (but complicated)
```

### New Way (OAuth)
```
Click "Connect with Strava"
  → Strava login page opens
  → User clicks "Authorize"
  → Automatically redirected back
  → Done! ✅
```

---

## 🔒 Security

✅ **No manual token handling** - Users never see tokens  
✅ **Standard OAuth 2.0** - Industry standard  
✅ **Automatic refresh** - Handles token expiration  
✅ **Revocable** - Users can revoke from Strava  
✅ **Professional** - Same as Nike, Garmin, etc.

---

## 🚨 Common Issues

### "Client ID not configured"
**Fix:** Add `STRAVA_CLIENT_ID` to `.env.local` and restart server

### "Callback domain mismatch"
**Fix:** Set Authorization Callback Domain to `localhost` (not `http://localhost:3000`, just `localhost`)

### Stuck in redirect loop
**Fix:** Clear browser cookies and restart server

---

## 📊 Scopes Requested

When users authorize, they grant:
- ✅ Read basic profile
- ✅ Read all activities (public + private)
- ✅ Read detailed profile info

---

## 🎉 Done!

Your app now has professional OAuth integration. Users can connect with one click, just like any other modern fitness app!

**See `STRAVA_OAUTH_SETUP.md` for detailed documentation.**

---

**Environment Variables Needed:**
```bash
STRAVA_CLIENT_ID=...        # From Strava app settings
STRAVA_CLIENT_SECRET=...    # From Strava app settings (keep secret!)
NEXTAUTH_URL=...            # Your app URL
```

**Authorization Callback Domain:**
- Development: `localhost`
- Production: `your-domain.com` (without www)

