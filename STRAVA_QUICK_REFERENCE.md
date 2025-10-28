# 🏃 Strava API - Quick Reference

## All Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/strava/oauth/authorize` | GET | Start OAuth flow | ✅ Session |
| `/api/strava/oauth/callback` | GET | OAuth callback | No (internal) |
| `/api/strava/connect` | GET | Check connection | ✅ Token |
| `/api/strava/connect` | DELETE | Disconnect | ✅ Token |
| `/api/strava/athlete` | GET | Get profile | ✅ Token |
| `/api/strava/stats` | GET | Get statistics | ✅ Token |
| `/api/strava/activities` | GET | Get activities | ✅ Token |

---

## Quick Examples

### Connect Strava (Flutter)
```dart
final url = '$apiUrl/api/strava/oauth/authorize';
await launchUrl(Uri.parse(url));
```

### Check If Connected
```dart
final response = await http.get(
  Uri.parse('$apiUrl/api/strava/connect'),
  headers: {'Authorization': 'Bearer $token'},
);
final connected = jsonDecode(response.body)['connected'];
```

### Get Recent Activities
```dart
final response = await http.get(
  Uri.parse('$apiUrl/api/strava/activities?per_page=10'),
  headers: {'Authorization': 'Bearer $token'},
);
```

### Get Stats
```dart
final response = await http.get(
  Uri.parse('$apiUrl/api/strava/stats'),
  headers: {'Authorization': 'Bearer $token'},
);
```

---

## Response Formats

### Connection Status
```json
{ "connected": true, "stravaConnection": { ... } }
```

### Activities
```json
{ "activities": [...], "count": 10 }
```

### Stats
```json
{ "stats": { "recentRunTotals": {...}, ... } }
```

### Athlete
```json
{ "athlete": { "id": 123, "username": "...", ... } }
```

---

## Common Errors

| Code | Message | Fix |
|------|---------|-----|
| 401 | Token expired | Reconnect Strava |
| 400 | Not connected | Connect Strava first |
| 404 | User not found | Check auth token |
| 500 | Server error | Check logs |

---

## Units Reference

- **Distance**: meters (÷ 1000 = km)
- **Time**: seconds (÷ 60 = minutes)
- **Speed**: m/s (× 3.6 = km/h)
- **Elevation**: meters
- **Heart Rate**: BPM
- **Calories**: kcal

---

## Setup Checklist

- [ ] Created Strava app at strava.com/settings/api
- [ ] Added `STRAVA_CLIENT_ID=183040` to `.env.local`
- [ ] Added `STRAVA_CLIENT_SECRET=...` to `.env.local`
- [ ] Set callback domain to `localhost` (or your domain)
- [ ] Restarted server
- [ ] Connected via `/profile` page
- [ ] Tested endpoints

---

**Need Help?** See `STRAVA_API_COMPLETE.md` for full documentation.

