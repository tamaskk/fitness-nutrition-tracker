import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { User } from 'lucide-react';

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!session) return null;

  return (
    <Layout>
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Profile management coming soon!</p>
        <div className="mt-6 text-left max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current User Info</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {session.user?.email}</p>
            <p><span className="font-medium">Name:</span> {session.user?.name || 'Not set'}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;

