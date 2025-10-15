# Authentication API Usage Guide

## Login API

The login API endpoint has been created at `/api/auth/login` and returns a JWT token for session management.

### Endpoint: POST `/api/auth/login`

#### Request Body:
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

#### Successful Response (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "country": "US",
    "language": "en",
    "preferences": { ... },
    "birthday": "1990-01-01",
    "gender": "male",
    "weight": { "value": 70, "unit": "kg" },
    "height": { "value": 175, "unit": "cm" },
    "dailyCalorieGoal": 2000
  }
}
```

#### Error Responses:
- `400`: Missing email or password
- `401`: Invalid credentials
- `405`: Method not allowed (only POST is accepted)
- `500`: Server error

---

## Frontend Usage

### 1. Login and Store Token

```typescript
// Example login function
async function loginUser(email: string, password: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store token in localStorage or sessionStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('Login successful:', data.user);
      return data;
    } else {
      console.error('Login failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

### 2. Use Token in Protected API Calls

```typescript
// Example authenticated API call
async function fetchUserData() {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/api/user/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return await response.json();
}
```

### 3. Logout

```typescript
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  // Redirect to login page
  window.location.href = '/login';
}
```

---

## Backend: Protecting API Routes

Use the helper functions from `/src/utils/auth.ts` to protect your API routes:

### Example 1: Basic Protected Route

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify authentication
  const user = requireAuth(req);
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // User is authenticated, proceed with logic
  res.status(200).json({
    message: 'Protected data',
    userId: user.userId,
    email: user.email,
  });
}
```

### Example 2: Getting User ID from Token

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdFromToken } from '@/utils/auth';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getUserIdFromToken(req);
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Fetch user-specific data
  const user = await User.findById(userId);
  
  res.status(200).json({ user });
}
```

---

## Environment Variables

Make sure to add a secure JWT secret to your `.env.local` file:

```
JWT_SECRET=your-super-secure-random-secret-key-here
```

**Important:** Never commit this secret to version control. Use a strong, random string in production.

---

## Token Details

- **Expiration:** 7 days
- **Algorithm:** HS256
- **Payload includes:** userId, email, firstName, lastName
- **Format:** JWT (JSON Web Token)

---

## Security Best Practices

1. Always use HTTPS in production
2. Store tokens in httpOnly cookies for better security (alternative to localStorage)
3. Implement token refresh mechanism for longer sessions
4. Add rate limiting to login endpoint
5. Log failed login attempts for security monitoring
6. Use a strong, random JWT_SECRET in production

