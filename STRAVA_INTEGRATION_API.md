# Strava Integration API Documentation

## Overview
Complete Strava integration for fitness tracking, allowing users to connect their Strava account, fetch athlete data, and sync activities.

---

## 🔗 Authentication

All endpoints require authentication via Bearer token or NextAuth session.

---

## API Endpoints

### 1. POST /api/strava/connect
**Connect Strava Account**

#### Request
```http
POST /api/strava/connect
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "accessToken": "5c857537c7594a08fb8f75bd6c5648eba655e824",
  "refreshToken": "optional_refresh_token",
  "athleteId": "12345678",
  "username": "athlete_username"
}
```

#### Response (200 OK)
```json
{
  "message": "Strava connected successfully",
  "stravaConnection": {
    "athleteId": "12345678",
    "username": "athlete_username",
    "connectedAt": "2024-10-28T12:00:00.000Z"
  }
}
```

---

### 2. GET /api/strava/connect
**Get Strava Connection Status**

#### Request
```http
GET /api/strava/connect
Authorization: Bearer <token>
```

#### Response - Connected (200 OK)
```json
{
  "connected": true,
  "stravaConnection": {
    "athleteId": "12345678",
    "username": "athlete_username",
    "connectedAt": "2024-10-28T12:00:00.000Z",
    "lastSyncedAt": "2024-10-28T14:30:00.000Z"
  }
}
```

#### Response - Not Connected (200 OK)
```json
{
  "connected": false,
  "message": "Strava not connected"
}
```

---

### 3. DELETE /api/strava/connect
**Disconnect Strava Account**

#### Request
```http
DELETE /api/strava/connect
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "message": "Strava disconnected successfully"
}
```

---

### 4. GET /api/strava/athlete
**Get Logged-In Athlete Data**

#### Request
```http
GET /api/strava/athlete
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "athlete": {
    "id": 12345678,
    "username": "athlete_username",
    "firstname": "John",
    "lastname": "Doe",
    "city": "San Francisco",
    "state": "California",
    "country": "United States",
    "sex": "M",
    "weight": 75.5,
    "profile": "https://dgalywyr863hv.cloudfront.net/pictures/athletes/12345678/large.jpg",
    "profile_medium": "https://dgalywyr863hv.cloudfront.net/pictures/athletes/12345678/medium.jpg"
  }
}
```

#### Error - Not Connected (400)
```json
{
  "message": "Strava not connected. Please connect your Strava account first."
}
```

#### Error - Token Expired (401)
```json
{
  "message": "Strava token expired or invalid. Please reconnect your Strava account.",
  "needsReconnect": true
}
```

---

### 5. GET /api/strava/activities
**Get Athlete Activities**

#### Request
```http
GET /api/strava/activities?page=1&per_page=30
Authorization: Bearer <token>
```

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `per_page` | number | 30 | Number of activities per page (max 200) |

#### Response (200 OK)
```json
{
  "activities": [
    {
      "id": 10324567890,
      "name": "Morning Run",
      "type": "Run",
      "distance": 5000,
      "movingTime": 1800,
      "elapsedTime": 1900,
      "totalElevationGain": 50,
      "startDate": "2024-10-28T06:00:00Z",
      "calories": 450.5,
      "averageSpeed": 2.78,
      "maxSpeed": 3.5,
      "averageHeartrate": 150.5,
      "maxHeartrate": 175
    },
    {
      "id": 10324567891,
      "name": "Evening Bike Ride",
      "type": "Ride",
      "distance": 20000,
      "movingTime": 3600,
      "elapsedTime": 3700,
      "totalElevationGain": 200,
      "startDate": "2024-10-27T18:00:00Z",
      "calories": 800,
      "averageSpeed": 5.56,
      "maxSpeed": 8.33,
      "averageHeartrate": 140.2,
      "maxHeartrate": 165
    }
  ],
  "count": 2
}
```

#### Field Descriptions
| Field | Unit | Description |
|-------|------|-------------|
| `distance` | meters | Total distance of activity |
| `movingTime` | seconds | Time actively moving |
| `elapsedTime` | seconds | Total time including pauses |
| `totalElevationGain` | meters | Total elevation climbed |
| `calories` | kcal | Calories burned |
| `averageSpeed` | m/s | Average speed (multiply by 3.6 for km/h) |
| `maxSpeed` | m/s | Maximum speed |
| `averageHeartrate` | bpm | Average heart rate |
| `maxHeartrate` | bpm | Maximum heart rate |

---

## 🔐 Security Notes

### ⚠️ IMPORTANT: Never Hardcode Access Tokens!

The access token provided in your example should **NEVER** be hardcoded or committed to source control.

**Recommended Approach:**

1. **OAuth Flow**: Implement proper OAuth 2.0 authorization flow
2. **Environment Variables**: Store tokens securely in environment variables
3. **Token Refresh**: Implement refresh token logic for expired tokens
4. **Secure Storage**: Store tokens encrypted in the database

### Proper OAuth Flow

```typescript
// Step 1: Redirect user to Strava authorization
const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const REDIRECT_URI = 'https://your-app.com/api/strava/callback';
const authUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=read,activity:read_all`;

// Step 2: Handle callback and exchange code for tokens
// (This requires additional implementation)
```

---

## 📊 Data Storage

### User Model Update
```typescript
stravaConnection?: {
  accessToken?: string;
  refreshToken?: string;
  athleteId?: string;
  username?: string;
  connectedAt?: Date;
  lastSyncedAt?: Date;
}
```

**Fields:**
- `accessToken`: Strava API access token (encrypted recommended)
- `refreshToken`: Token for refreshing expired access tokens
- `athleteId`: Strava athlete ID
- `username`: Strava username
- `connectedAt`: When user first connected Strava
- `lastSyncedAt`: Last time data was fetched from Strava

---

## 🎯 Frontend Integration

### Flutter Example

```dart
// Connect Strava
Future<void> connectStrava(String accessToken) async {
  final response = await http.post(
    Uri.parse('$apiUrl/api/strava/connect'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'accessToken': accessToken,
    }),
  );

  if (response.statusCode == 200) {
    print('Strava connected successfully');
  }
}

// Get connection status
Future<Map<String, dynamic>> getStravaStatus() async {
  final response = await http.get(
    Uri.parse('$apiUrl/api/strava/connect'),
    headers: {
      'Authorization': 'Bearer $token',
    },
  );

  return jsonDecode(response.body);
}

// Get athlete data
Future<Map<String, dynamic>> getAthleteData() async {
  final response = await http.get(
    Uri.parse('$apiUrl/api/strava/athlete'),
    headers: {
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to fetch athlete data');
  }
}

// Get activities
Future<List<dynamic>> getActivities({int page = 1, int perPage = 30}) async {
  final response = await http.get(
    Uri.parse('$apiUrl/api/strava/activities?page=$page&per_page=$perPage'),
    headers: {
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['activities'];
  } else {
    throw Exception('Failed to fetch activities');
  }
}

// Disconnect Strava
Future<void> disconnectStrava() async {
  final response = await http.delete(
    Uri.parse('$apiUrl/api/strava/connect'),
    headers: {
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    print('Strava disconnected successfully');
  }
}
```

### React/Next.js Example

```typescript
// Connect Strava
async function connectStrava(accessToken: string) {
  const response = await fetch('/api/strava/connect', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });

  return await response.json();
}

// Get connection status
async function getStravaStatus() {
  const response = await fetch('/api/strava/connect', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return await response.json();
}

// Get athlete data
async function getAthleteData() {
  const response = await fetch('/api/strava/athlete', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch athlete data');
  }

  return await response.json();
}

// Get activities
async function getActivities(page = 1, perPage = 30) {
  const response = await fetch(`/api/strava/activities?page=${page}&per_page=${perPage}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }

  const data = await response.json();
  return data.activities;
}

// Disconnect Strava
async function disconnectStrava() {
  const response = await fetch('/api/strava/connect', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return await response.json();
}
```

---

## 🚀 Usage Flow

### 1. Connect Account
```
User clicks "Connect Strava" → 
OAuth authorization (external) → 
Get access token → 
POST /api/strava/connect with token → 
Connection stored in database
```

### 2. Fetch Data
```
Check connection status (GET /api/strava/connect) → 
If connected, fetch athlete data (GET /api/strava/athlete) → 
Fetch recent activities (GET /api/strava/activities)
```

### 3. Sync Activities
```
Periodically call GET /api/strava/activities → 
Parse activity data → 
Save to workout tracking system → 
Calculate calories burned
```

### 4. Disconnect
```
User clicks "Disconnect Strava" → 
DELETE /api/strava/connect → 
Token removed from database
```

---

## 📱 Settings UI Component Example

```tsx
// Strava Settings Component
function StravaSettings() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const status = await getStravaStatus();
      setConnected(status.connected);
      if (status.connected) {
        const athleteData = await getAthleteData();
        setAthlete(athleteData.athlete);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    const accessToken = prompt('Enter your Strava access token:');
    if (accessToken) {
      try {
        await connectStrava(accessToken);
        await checkConnection();
      } catch (error) {
        alert('Failed to connect Strava');
      }
    }
  }

  async function handleDisconnect() {
    if (confirm('Are you sure you want to disconnect Strava?')) {
      try {
        await disconnectStrava();
        setConnected(false);
        setAthlete(null);
      } catch (error) {
        alert('Failed to disconnect Strava');
      }
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="strava-settings">
      <h2>Strava Integration</h2>
      
      {connected ? (
        <div className="connected-state">
          <div className="athlete-info">
            {athlete && (
              <>
                <img src={athlete.profile_medium} alt="Profile" />
                <h3>{athlete.firstname} {athlete.lastname}</h3>
                <p>@{athlete.username}</p>
              </>
            )}
          </div>
          <button onClick={handleDisconnect} className="disconnect-btn">
            Disconnect Strava
          </button>
        </div>
      ) : (
        <div className="disconnected-state">
          <p>Connect your Strava account to sync your activities automatically.</p>
          <button onClick={handleConnect} className="connect-btn">
            Connect with Strava
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Future Enhancements

- [ ] Implement proper OAuth 2.0 flow
- [ ] Add refresh token logic for expired tokens
- [ ] Automatic activity sync (webhooks)
- [ ] Convert Strava activities to workout entries
- [ ] Display activity statistics and charts
- [ ] Sync with calorie burn tracking
- [ ] Activity type mapping (run, bike, swim, etc.)
- [ ] Personal records tracking
- [ ] Segment efforts tracking

---

## ✅ Checklist

- [x] User model updated with Strava fields
- [x] TypeScript types updated
- [x] POST /api/strava/connect endpoint
- [x] GET /api/strava/connect endpoint
- [x] DELETE /api/strava/connect endpoint
- [x] GET /api/strava/athlete endpoint
- [x] GET /api/strava/activities endpoint
- [ ] Frontend settings UI with Strava tab
- [ ] OAuth 2.0 authorization flow
- [ ] Token refresh mechanism
- [ ] Activity sync to workout tracking

---

**Last Updated**: 2024-10-28  
**Status**: ✅ API Complete - Frontend Integration Needed  
**Strava API Version**: V3

