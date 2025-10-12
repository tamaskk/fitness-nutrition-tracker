# Admin Dashboard Setup

This document explains how to set up and use the admin dashboard for the FitTracker application.

## Setup

### 1. Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
ADMIN_EMAIL=your-admin-email@example.com
```

Replace `your-admin-email@example.com` with the email address you want to use for admin access.

### 2. Admin User Registration

The admin user must be registered as a regular user first:

1. Go to `/signup` and create an account with the email address specified in `ADMIN_EMAIL`
2. The system will automatically grant admin privileges to users with this email address

## Accessing the Admin Dashboard

### Option 1: Direct Admin Login
- Navigate to `/admin/login`
- Sign in with your admin credentials
- You'll be redirected to the admin dashboard at `/admin`

### Option 2: Regular Login + Navigation
- Sign in through the regular login page (`/login`)
- If you're an admin user, you'll see an "Admin Dashboard" link in the sidebar
- Click the link to access the admin dashboard

## Admin Dashboard Features

### User Statistics
- **Total Users**: Total number of registered users
- **New This Month**: Users who registered in the current month
- **Active This Week**: Users who have been active (logged meals or workouts) in the past week
- **Average Age**: Average age of users who provided their age
- **Gender Distribution**: Breakdown of users by gender

### User Management
- View all registered users in a table format
- See basic user information including:
  - Name and email
  - Registration date
  - Age, gender, weight, height (if provided)
  - Daily calorie goal
- Expandable user details for more information

### Security Features
- Admin access is restricted to users with the email specified in `ADMIN_EMAIL`
- All admin API endpoints require admin authentication
- Admin users are clearly marked in the session with an `isAdmin` flag
- Non-admin users cannot access admin pages or APIs

## API Endpoints

### GET /api/admin/stats
Returns comprehensive user statistics and user list.

**Authentication**: Requires admin privileges
**Response**: 
```json
{
  "totalUsers": 150,
  "newUsersThisMonth": 25,
  "activeUsersThisWeek": 45,
  "averageAge": 32,
  "genderDistribution": {
    "male": 80,
    "female": 65,
    "other": 5
  },
  "users": [...]
}
```

## Security Considerations

1. **Environment Variable**: Keep your `ADMIN_EMAIL` secure and don't commit it to version control
2. **Admin Password**: Use a strong password for your admin account
3. **Session Management**: Admin sessions expire with regular NextAuth session management
4. **API Protection**: All admin endpoints verify admin status before returning data

## Troubleshooting

### "Access denied" Error
- Ensure your email matches the `ADMIN_EMAIL` environment variable exactly
- Check that you're signed in with the correct account
- Verify the environment variable is set correctly

### Admin Link Not Showing
- Make sure you're signed in with an admin account
- Check that the `ADMIN_EMAIL` environment variable is set
- Try signing out and signing back in

### Dashboard Not Loading
- Check browser console for errors
- Verify the `/api/admin/stats` endpoint is accessible
- Ensure MongoDB connection is working
