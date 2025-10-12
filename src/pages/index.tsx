import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { formatDateForAPI, getCurrentDateString } from '@/utils/dateUtils';
import { calculateDailyBalance, formatCalories } from '@/utils/calculations';
import { DailySummary } from '@/types';
import { Plus, Target, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import Link from 'next/link';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { preferences } = useUserPreferences();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchDailySummary();
  }, [session, status, router]);

  const fetchDailySummary = async () => {
    try {
      const today = getCurrentDateString();
      const response = await fetch(`/api/summary?date=${today}`);
      
      if (response.ok) {
        const data = await response.json();
        setDailySummary(data);
      } else {
        // If no data, create empty summary
        setDailySummary({
          date: today,
          totalCaloriesConsumed: 0,
          totalCaloriesBurned: 0,
          calorieGoal: 2000, // Default goal
          macros: { protein: 0, carbs: 0, fat: 0 },
          mealsCount: 0,
          workoutsCount: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  const balance = dailySummary ? calculateDailyBalance(
    dailySummary.totalCaloriesConsumed,
    dailySummary.totalCaloriesBurned,
    dailySummary.calorieGoal
  ) : null;

  const allQuickActions = [
    { name: 'Étkezés rögzítése', href: '/meals', icon: Plus, color: 'bg-green-500', feature: 'mealPlans' },
    { name: 'Edzés rögzítése', href: '/workouts', icon: Activity, color: 'bg-blue-500', feature: 'trainings' },
    { name: 'Recept keresése', href: '/recipes', icon: Plus, color: 'bg-purple-500', feature: 'recipes' },
    { name: 'Bevásárlólista', href: '/shopping', icon: Plus, color: 'bg-orange-500', feature: 'shoppingList' },
  ];

  // Filter quick actions based on enabled features
  const quickActions = allQuickActions.filter(action => {
    return preferences?.[action.feature as keyof typeof preferences] === true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {new Date().getHours() < 12 ? 'Jó reggelt' : new Date().getHours() < 18 ? 'Jó napot' : 'Jó estét'}, {session.user?.name || 'there'}!
            </h1>
            <p className="text-gray-600">Itt a mai fitness összefoglalód</p>
          </div>
        </div>

        {/* Daily Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Elfogyasztott kalóriák</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailySummary ? formatCalories(dailySummary.totalCaloriesConsumed) : '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Elégetett kalóriák</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailySummary ? formatCalories(dailySummary.totalCaloriesBurned) : '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Napi cél</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailySummary ? formatCalories(dailySummary.calorieGoal) : '2,000'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  balance?.isOverGoal ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {balance?.isOverGoal ? (
                    <TrendingUp className="w-5 h-5 text-red-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Egyenleg</p>
                <p className={`text-2xl font-bold ${
                  balance?.isOverGoal ? 'text-red-600' : 'text-green-600'
                }`}>
                  {balance ? `${balance.isOverGoal ? '+' : ''}${formatCalories(Math.abs(balance.balance))}` : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {dailySummary && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Napi haladás</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Kalóriák ({balance?.percentageOfGoal || 0}% a célból)</span>
                  <span>{formatCalories(dailySummary.totalCaloriesConsumed)} / {formatCalories(dailySummary.calorieGoal)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      balance?.isOverGoal ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(balance?.percentageOfGoal || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Gyors műveletek</h3>
          {quickActions.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mb-2`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{action.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nincsenek engedélyezett funkciók</p>
              <p className="text-sm text-gray-400">
                Menj a <Link href="/profile" className="text-blue-600 hover:text-blue-500">Profil</Link> oldalra, hogy engedélyezd a kívánt funkciókat.
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meals Card - Only show if mealPlans is enabled */}
          {preferences?.mealPlans && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mai étkezések</h3>
              {dailySummary?.mealsCount ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{dailySummary.mealsCount} étkezés rögzítve</p>
                  <Link href="/meals" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                    Összes étkezés megtekintése →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Ma még nincsenek rögzített étkezések</p>
                  <Link
                    href="/meals"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Első étkezés rögzítése
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Workouts Card - Only show if trainings is enabled */}
          {preferences?.trainings && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mai edzések</h3>
              {dailySummary?.workoutsCount ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{dailySummary.workoutsCount} edzés rögzítve</p>
                  <Link href="/workouts" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                    Összes edzés megtekintése →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Ma még nincsenek rögzített edzések</p>
                  <Link
                    href="/workouts"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Első edzés rögzítése
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
    </Layout>
  );
}
