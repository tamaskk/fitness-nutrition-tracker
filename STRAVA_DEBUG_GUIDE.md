# 🔧 Strava Connection Debug Guide

## Issue: "Connected: false" after authorization

If you authorized on Strava but still see `{connected: false, message: "Strava not connected"}`, follow these steps:

---

## Step 1: Check Your `.env.local` File

You need **BOTH** Client ID and Client Secret!

```bash
# .env.local (in your project root)
STRAVA_CLIENT_ID=183040
STRAVA_CLIENT_SECRET=your_secret_here_from_strava

# Also needed:
NEXTAUTH_URL=http://localhost:3000
```

### How to Get Client Secret:

1. Go to: **https://www.strava.com/settings/api**
2. Look at your app
3. Find **"Client Secret"** field
4. Copy the long string (like: `abc123def456ghi789...`)
5. Add it to `.env.local`

---

## Step 2: Restart Your Server

**IMPORTANT:** Changes to `.env.local` require a server restart!

```bash
# Stop your server (Ctrl+C)
# Then start again:
npm run dev
```

---

## Step 3: Check Console Logs

After clicking "Connect with Strava" and authorizing, check your **terminal console** for logs like:

### ✅ Success Logs:
```
🔵 Strava OAuth callback received
Code present: true
Client ID present: true
Client Secret present: true
🔄 Exchanging authorization code for token...
Token exchange response status: 200
✅ Token received successfully
Athlete ID: 12345678
🔍 Getting authenticated user...
✅ User authenticated: your@email.com
💾 Saving to database...
✅ User found in database
✅ Strava connected successfully via OAuth for user: your@email.com
🎉 Redirecting to profile with success message
```

### ❌ Error Logs to Look For:

**Missing Client Secret:**
```
Client Secret present: false
❌ Missing Strava OAuth credentials
```
**Fix:** Add `STRAVA_CLIENT_SECRET` to `.env.local`

**Token Exchange Failed:**
```
❌ Strava token exchange failed: {"message": "Bad Request", ...}
```
**Fix:** Check Client ID and Secret are correct

**No User Found:**
```
❌ No authenticated user found
```
**Fix:** Make sure you're logged in before connecting Strava

---

## Step 4: Common Issues & Fixes

### Issue 1: Missing Client Secret
**Symptoms:** Redirects immediately without connecting
**Fix:**
1. Get Client Secret from https://www.strava.com/settings/api
2. Add to `.env.local`: `STRAVA_CLIENT_SECRET=your_secret`
3. Restart server

### Issue 2: Wrong Client ID/Secret
**Symptoms:** "Token exchange failed" in logs
**Fix:**
1. Double-check values from Strava app settings
2. No spaces before/after the values
3. Save file and restart server

### Issue 3: Not Logged In
**Symptoms:** Redirected to login page
**Fix:**
1. Login to your app first
2. Then try connecting Strava

### Issue 4: Callback Domain Mismatch
**Symptoms:** Strava shows "Redirect URI mismatch" error
**Fix:**
1. Go to https://www.strava.com/settings/api
2. Set "Authorization Callback Domain" to: `localhost` (not `http://localhost:3000`, just `localhost`)
3. Save and try again

### Issue 5: Server Not Restarted
**Symptoms:** Changes not working
**Fix:**
1. Stop server (Ctrl+C)
2. Start again: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## Step 5: Test Again

1. Make sure `.env.local` has **both** Client ID and Secret
2. Server is restarted
3. You're logged in to your app
4. Go to `/profile`
5. Click "Connect with Strava"
6. Authorize on Strava
7. Check console logs in terminal

---

## Quick Checklist

- [ ] Added `STRAVA_CLIENT_ID` to `.env.local`
- [ ] Added `STRAVA_CLIENT_SECRET` to `.env.local`
- [ ] Set `NEXTAUTH_URL=http://localhost:3000` in `.env.local`
- [ ] Restarted dev server after adding env variables
- [ ] Authorization Callback Domain in Strava is set to `localhost`
- [ ] Logged in to your app before connecting Strava
- [ ] Checked terminal console logs during OAuth flow

---

## What the Logs Mean

| Log Message | Meaning |
|------------|---------|
| `🔵 Strava OAuth callback received` | Callback endpoint was called |
| `Code present: true` | Authorization code received from Strava ✅ |
| `Client Secret present: true` | Environment variable is set ✅ |
| `Token exchange response status: 200` | Strava accepted our request ✅ |
| `✅ Token received successfully` | Got access token from Strava ✅ |
| `✅ User authenticated` | Found logged-in user ✅ |
| `✅ User found in database` | User exists in MongoDB ✅ |
| `✅ Strava connected successfully` | Everything worked! 🎉 |

---

## Still Not Working?

### Copy your console logs and check:

1. **If you see `Client Secret present: false`:**
   - Missing from `.env.local`
   - Server not restarted after adding it

2. **If you see `Token exchange response status: 400`:**
   - Wrong Client ID or Secret
   - Double-check values in Strava app settings

3. **If you see `❌ No authenticated user found`:**
   - Not logged in
   - Session expired
   - Cookies blocked

4. **If callback never runs (no logs at all):**
   - Wrong callback domain in Strava settings
   - Should be `localhost` (not `http://localhost:3000`)

---

## Example `.env.local` File

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Strava OAuth (ADD THESE!)
STRAVA_CLIENT_ID=183040
STRAVA_CLIENT_SECRET=abc123def456ghi789jkl0mnopqrs

# OpenAI
OPENAI_API_KEY=sk-...
```

---

## Expected Flow

```
1. User clicks "Connect with Strava"
   ↓
2. Redirect to Strava login page
   ↓
3. User clicks "Authorize"
   ↓
4. Strava redirects to: /api/strava/oauth/callback?code=XXXXX
   ↓
5. Callback exchanges code for token (needs Client Secret!)
   ↓
6. Saves token to database
   ↓
7. Redirects to /profile?strava_success=true
   ↓
8. Shows green "Connected" status ✅
```

---

**Most Common Fix:** Add `STRAVA_CLIENT_SECRET` to `.env.local` and restart server! 🚀

