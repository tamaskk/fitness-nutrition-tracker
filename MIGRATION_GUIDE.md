# User Schema Migration Guide

## Problem
Existing users were created with the old User schema that only had basic fields (email, passwordHash, dailyCalorieGoal, createdAt). The new schema includes additional fields like firstName, lastName, country, language, preferences, and onboardingAnswers.

## Solution

### Step 1: Run the Migration API

I've created a migration endpoint that will update all existing users with the missing fields. You can run this by making a POST request to:

```
POST /api/migrate-users
```

This will:
- Find all users missing the new fields
- Add default values for missing required fields
- Initialize preferences and onboardingAnswers objects
- Update all users in the database

### Step 2: Test the Migration

After running the migration, you can test it by checking a specific user:

```
GET /api/debug-user?email=your-email@example.com
```

This will show you the complete user document and which fields are present.

### Step 3: Test New Registrations

You can test new user registration with the test endpoint:

```
POST /api/test-signup
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User",
  "country": "US",
  "language": "en"
}
```

### Step 4: Verify the Fix

After migration, your user document should look like this:

```json
{
  "_id": "68ebd17fbd086dba04cb852b",
  "email": "tamas+2@blcks.io",
  "firstName": "Unknown",
  "lastName": "User", 
  "country": "Other",
  "language": "en",
  "passwordHash": "$2a$12$PTYs3V8IJsBRBGYJBfAU/OmvOPFeGgN7H1kIV5wzHksOZ2WGS6X7y",
  "preferences": {
    "mealPlans": false,
    "recipes": false,
    "trainings": false,
    "shoppingList": false,
    "priceMonitor": false,
    "finance": false
  },
  "onboardingAnswers": {
    "mealPlans": {},
    "recipes": {},
    "trainings": {},
    "shoppingList": {},
    "priceMonitor": {},
    "finance": {}
  },
  "dailyCalorieGoal": 2000,
  "createdAt": "2025-10-12T16:04:15.415Z",
  "__v": 0
}
```

## Why This Happened

The issue occurred because:
1. The User model schema was updated after users were already created
2. MongoDB doesn't automatically add new fields to existing documents
3. The old user documents still exist with the original schema

## Prevention

For future schema changes:
1. Always run migration scripts when updating user schemas
2. Use default values in the schema definition
3. Test with existing data before deploying changes

## Files Created

- `/src/pages/api/migrate-users.ts` - Migration endpoint
- `/src/pages/api/debug-user.ts` - Debug endpoint to check user data
- `/src/pages/api/test-signup.ts` - Test endpoint for new registrations

## Next Steps

1. Run the migration API endpoint
2. Test with the debug endpoint
3. Try registering a new user to verify the fix
4. Remove the debug endpoints once everything is working
