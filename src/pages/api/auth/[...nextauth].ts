import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.nutrition.read',
        },
      },
    }),
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
    async jwt({ token, user, account, trigger, session }) {
      // Allow client to request token updates (e.g., clearing access token)
      if (trigger === 'update' && session) {
        if ('accessToken' in session) token.accessToken = undefined as any;
        if ('refreshToken' in session) token.refreshToken = undefined as any;
      }
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      // Save the access token from Google OAuth for Google Fit API access
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;

        // Persist Google Fit connection details on the user document when available
        if (account.provider === 'google') {
          try {
            await connectToDatabase();
            const email = (token as any).email || (user as any)?.email;
            if (email) {
              const dbUser = await User.findOne({ email });
              if (dbUser) {
                dbUser.googleFitConnection = {
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token,
                  scope: (account as any).scope,
                  tokenType: (account as any).token_type,
                  expiryDate: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
                  googleUserId: (account as any).providerAccountId,
                  connectedAt: new Date(),
                } as any;
                await dbUser.save();
                // Ensure token id maps to our internal user id for downstream queries
                (token as any).id = (dbUser._id as any).toString();
              }
            }
          } catch (err) {
            console.error('Failed to persist Google Fit connection:', err);
          }
        }
      }
      return token;
    },
    async session({ session, token, trigger, newSession }) {
      if (trigger === 'update' && newSession) {
        // Merge updates from client (used to clear access tokens)
        session = { ...session, ...newSession } as any;
      }
      if (token) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
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

