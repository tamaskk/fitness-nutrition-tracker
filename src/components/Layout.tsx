import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Languages
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: t('Dashboard'), href: '/', icon: Home },
    { name: t('Meals'), href: '/meals', icon: Utensils },
    { name: t('Recipes'), href: '/recipes', icon: Book },
    { name: t('Workouts'), href: '/workouts', icon: Dumbbell },
    { name: t('Shopping'), href: '/shopping', icon: ShoppingCart },
    { name: t('Profile'), href: '/profile', icon: User },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hu' : 'en');
  };

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">FitTracker</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
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
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4 space-y-2">
            <button
              onClick={toggleLanguage}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <Languages className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              {language === 'en' ? 'Magyar' : 'English'}
            </button>
            <button
              onClick={handleSignOut}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              {t('Sign out')}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r">
          <div className="flex h-16 items-center px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">FitTracker</h1>
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
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center mb-4">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{session.user?.name || session.user?.email}</p>
                <p className="text-xs text-gray-500">{session.user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={toggleLanguage}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <Languages className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {language === 'en' ? 'Magyar' : 'English'}
              </button>
              <button
                onClick={handleSignOut}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {t('Sign out')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <h1 className="text-xl font-bold text-gray-900 self-center">FitTracker</h1>
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

