# Strava Integration - Quick Setup Guide

## ✅ Backend Complete!

I've successfully implemented the Strava integration backend. Here's what's been created:

---

## 📁 Files Created/Modified

### 1. **User Model** (`src/models/User.ts`)
Added `stravaConnection` field to store:
- Access token
- Refresh token
- Athlete ID
- Username
- Connection timestamps

### 2. **TypeScript Types** (`src/types/index.ts`)
Added `stravaConnection` type definition

### 3. **API Endpoints**
Created 3 new API endpoints:

- **`/api/strava/connect`** (POST, GET, DELETE)
  - Connect Strava account
  - Check connection status
  - Disconnect Strava account

- **`/api/strava/athlete`** (GET)
  - Fetch logged-in athlete data from Strava

- **`/api/strava/activities`** (GET)
  - Fetch athlete activities with pagination

---

## 🚀 How to Use (Backend)

### 1. Connect Strava Account
```bash
POST /api/strava/connect
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "accessToken": "5c857537c7594a08fb8f75bd6c5648eba655e824",
  "athleteId": "optional",
  "username": "optional"
}
```

### 2. Check Connection Status
```bash
GET /api/strava/connect
Authorization: Bearer <your_token>
```

### 3. Get Athlete Data
```bash
GET /api/strava/athlete
Authorization: Bearer <your_token>
```

### 4. Get Activities
```bash
GET /api/strava/activities?page=1&per_page=30
Authorization: Bearer <your_token>
```

### 5. Disconnect
```bash
DELETE /api/strava/connect
Authorization: Bearer <your_token>
```

---

## 📱 Frontend Integration Needed

You'll need to add a **Strava settings tab** in your app's settings/profile page. Here's what you need to do:

### Flutter App

1. **Add Strava Settings Tab**
   - Add a new tab/section in your settings page
   - Show connection status
   - Display "Connect" button if not connected
   - Display athlete info + "Disconnect" button if connected

2. **Connection Flow**
   ```dart
   // When user clicks "Connect with Strava"
   final accessToken = "5c857537c7594a08fb8f75bd6c5648eba655e824";
   
   final response = await http.post(
     Uri.parse('$apiUrl/api/strava/connect'),
     headers: {
       'Authorization': 'Bearer $userToken',
       'Content-Type': 'application/json',
     },
     body: jsonEncode({'accessToken': accessToken}),
   );
   ```

3. **Display Activities**
   - Create an activities list page
   - Fetch from `/api/strava/activities`
   - Display run/bike/swim activities with stats

### Web App (if you have one)

Add a settings page with Strava integration section similar to the example in the documentation.

---

## ⚠️ Security Warning

**IMPORTANT**: The access token `5c857537c7594a08fb8f75bd6c5648eba655e824` should:

1. ❌ **NEVER** be hardcoded in the frontend
2. ❌ **NEVER** be committed to Git
3. ✅ Be entered by the user or obtained via OAuth flow
4. ✅ Be stored securely in the backend database only

### Recommended Implementation (Future):

Instead of manually entering tokens, implement **OAuth 2.0 flow**:

1. User clicks "Connect with Strava"
2. Redirect to Strava authorization page
3. Strava redirects back with authorization code
4. Exchange code for access token (server-side)
5. Store token in database

This requires:
- Strava App registration (Client ID + Client Secret)
- OAuth callback endpoint
- Token exchange logic

---

## 🎯 Example Frontend Flow

```
Settings Page
├─ Profile Tab
├─ Preferences Tab
└─ Integrations Tab ← NEW
   └─ Strava Section
      ├─ Connection Status
      ├─ Connect Button (if not connected)
      └─ Athlete Info + Disconnect Button (if connected)
```

### When Connected, Show:
- ✅ Athlete profile picture
- ✅ Athlete name & username
- ✅ Connection date
- ✅ Last synced date
- ✅ Button to view activities
- ✅ Disconnect button

---

## 📊 Data You Can Now Access

### Athlete Information
- Name, username, location
- Profile picture
- Weight (can sync to your app!)
- Gender

### Activities
- Activity name & type (Run, Ride, Swim, etc.)
- Distance, duration, pace
- Elevation gain
- **Calories burned** ← Can be used in your calorie tracking!
- Heart rate data
- Speed data

---

## 🔄 Next Steps

1. **Restart your dev server** (for schema changes)
2. **Add Strava settings tab** in your frontend
3. **Test connection** with the provided access token
4. **Fetch athlete data** to verify it works
5. **Display activities** in a list
6. **(Optional) Implement OAuth flow** for better UX

---

## 🧪 Quick Test

You can test the backend immediately using cURL:

```bash
# 1. Connect
curl -X POST http://localhost:3000/api/strava/connect \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accessToken":"5c857537c7594a08fb8f75bd6c5648eba655e824"}'

# 2. Get athlete data
curl -X GET http://localhost:3000/api/strava/athlete \
  -H "Authorization: Bearer YOUR_USER_TOKEN"

# 3. Get activities
curl -X GET http://localhost:3000/api/strava/activities \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

---

## 📄 Full Documentation

See **`STRAVA_INTEGRATION_API.md`** for:
- Complete API reference
- All endpoints and parameters
- Error handling
- Frontend integration examples (Flutter & React)
- Security best practices
- Future enhancements

---

## ✅ Summary

**✅ DONE:**
- Backend API complete
- Database schema updated
- 3 API endpoints created
- Authentication integrated
- Error handling implemented
- Documentation written

**📱 TODO (Frontend):**
- Add Strava tab in settings
- Implement connection UI
- Display athlete data
- Show activities list
- (Optional) OAuth 2.0 flow

---

**The backend is ready! Now you just need to add the UI in your Flutter app to connect and display Strava data.** 🎉

