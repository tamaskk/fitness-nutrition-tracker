import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  Utensils, 
  Book, 
  Dumbbell, 
  ShoppingCart, 
  User, 
  LogOut,
  Menu,
  X,
  DollarSign,
  TrendingUp,
  Shield,
  Bell
} from 'lucide-react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useNotificationContext } from '@/contexts/NotificationContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { preferences } = useUserPreferences();
  const { unreadCount } = useNotificationContext();

  // All possible navigation items
  const allNavigation = [
    { name: 'Irányítópult', href: '/dashboard', icon: Home, key: 'dashboard' },
    { name: 'Étkezések', href: '/meals', icon: Utensils, key: 'mealPlans' },
    { name: 'Receptek', href: '/recipes', icon: Book, key: 'recipes' },
    { name: 'Edzések', href: '/training', icon: Dumbbell, key: 'trainings' },
    { name: 'Bevásárlás', href: '/shopping', icon: ShoppingCart, key: 'shoppingList' },
    { name: 'Árfigyelő', href: '/price-monitor', icon: TrendingUp, key: 'priceMonitor' },
    { name: 'Pénzügyek', href: '/finance', icon: DollarSign, key: 'finance' },
    { name: 'Értesítések', href: '/notifications', icon: Bell, key: 'notifications' },
    { name: 'Profil', href: '/profile', icon: User, key: 'profile' },
  ];

  // Filter navigation based on user preferences
  const navigation = allNavigation.filter(item => {
    // Always show dashboard, profile, and notifications
    if (item.key === 'dashboard' || item.key === 'profile' || item.key === 'notifications') {
      return true;
    }
    // Show other items only if the feature is enabled
    const isEnabled = preferences?.[item.key as keyof typeof preferences] === true;
    console.log(`Navigation item ${item.name} (${item.key}): ${isEnabled ? 'SHOW' : 'HIDE'}`);
    return isEnabled;
  });

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 dark:bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-zinc-950">
          <div className="flex h-16 items-center justify-between px-4 border-b dark:border-zinc-900">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">FitTracker</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                  }`} />
                  <span className="flex-1">{item.name}</span>
                  {item.key === 'notifications' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
            {session.user?.isAdmin && (
              <div className="border-t dark:border-zinc-900 pt-4 mt-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2 px-2">
                  Admin
                </div>
                {adminNavigation.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
          <div className="border-t dark:border-zinc-900 p-4 space-y-2">
            <button
              onClick={handleSignOut}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
              Kijelentkezés
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-950 border-r dark:border-zinc-900">
          <div className="flex h-16 items-center px-4 border-b dark:border-zinc-900">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">FitTracker</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                  }`} />
                  <span className="flex-1">{item.name}</span>
                  {item.key === 'notifications' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
            {session.user?.isAdmin && (
              <div className="border-t dark:border-zinc-900 pt-4 mt-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2 px-2">
                  Admin
                </div>
                {adminNavigation.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
          <div className="border-t dark:border-zinc-900 p-4">
            <div className="flex items-center mb-4">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{session.user?.name || session.user?.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-600">{session.user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleSignOut}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
                Kijelentkezés
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 bg-white dark:bg-zinc-950 border-b dark:border-zinc-900 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 dark:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white self-center">FitTracker</h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

