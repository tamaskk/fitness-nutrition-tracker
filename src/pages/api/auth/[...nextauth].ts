import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        adminPassword: { label: 'Admin Password', type: 'password' },
        isAdmin: { label: 'Is Admin', type: 'text' }
      },
      async authorize(credentials) {
        console.log('NextAuth received credentials:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          hasAdminPassword: !!credentials?.adminPassword,
          isAdmin: credentials?.isAdmin,
          allCredentials: credentials
        });
        
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Check if this is an admin login request
          const isAdminRequest = credentials.isAdmin === 'true';
          
          if (isAdminRequest) {
            // For admin login, check against environment variables directly
            const adminEmail = process.env.ADMIN_EMAIL;
            const adminPassword = process.env.ADMIN_PASSWORD;
            
            if (!adminEmail || !adminPassword) {
              console.log('Admin credentials not configured');
              return null;
            }
            
            // Verify admin credentials
            if (credentials.email !== adminEmail || credentials.password !== adminPassword) {
              console.log('Admin credentials validation failed');
              return null;
            }
            
            console.log('Admin credentials validation passed');
            
            return {
              id: 'admin',
              email: adminEmail,
              name: 'Administrator',
              firstName: 'Admin',
              lastName: '',
              isAdmin: true,
            };
          } else {
            // Regular user login - check against database
            await connectToDatabase();
            
            const user = await User.findOne({ email: credentials.email });
            if (!user) {
              return null;
            }

            const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (!isPasswordValid) {
              return null;
            }

            return {
              id: (user._id as any).toString(),
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              firstName: user.firstName,
              lastName: user.lastName,
              isAdmin: false,
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

