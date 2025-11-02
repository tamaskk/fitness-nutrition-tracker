import mongoose from 'mongoose';
import NextAuth from 'next-auth';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      firstName?: string;
      lastName?: string;
      isAdmin?: boolean;
    };
    accessToken?: string;
    refreshToken?: string;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    firstName?: string;
    lastName?: string;
    isAdmin?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    isAdmin?: boolean;
    accessToken?: string;
    refreshToken?: string;
  }
}

