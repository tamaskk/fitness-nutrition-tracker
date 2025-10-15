import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface TokenPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

/**
 * Verify JWT token from request headers
 * @param req - NextApiRequest object
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(req: NextApiRequest): TokenPayload | null {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Middleware to protect API routes
 * Returns the decoded token if valid, or sends error response
 */
export function requireAuth(req: NextApiRequest): TokenPayload | null {
  const decoded = verifyToken(req);
  
  if (!decoded) {
    return null;
  }
  
  return decoded;
}

/**
 * Extract user ID from authorization token
 */
export function getUserIdFromToken(req: NextApiRequest): string | null {
  const decoded = verifyToken(req);
  return decoded ? decoded.userId : null;
}

/**
 * Extract user info from authorization token
 */
export function getUserFromToken(req: NextApiRequest): { email: string; userId: string } | null {
  const decoded = verifyToken(req);
  return decoded ? { email: decoded.email, userId: decoded.userId } : null;
}

