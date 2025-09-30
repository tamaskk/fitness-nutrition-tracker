import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import MealForm from '@/components/MealForm';
import { getCurrentDateString } from '@/utils/dateUtils';
import { MealEntry, MealFormData } from '@/types';
import { Plus, Clock, Utensils, Trash2 } from 'lucide-react';
import { getMealTypeColor } from '@/utils/calculations';
import toast from 'react-hot-toast';

const MealsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getCurrentDateString());
  const [showMealForm, setShowMealForm] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('lunch');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchMeals();
  }, [session, status, router, selectedDate]);

  const fetchMeals = async () => {
    try {
      const response = await fetch(`/api/meals?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      toast.error('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (mealData: MealFormData & { date: string }) => {
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) {
        throw new Error('Failed to add meal');
      }

      toast.success('Meal added successfully!');
      fetchMeals(); // Refresh the meals list
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to add meal');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      const response = await fetch(`/api/meals?id=${mealId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete meal');
      }

      toast.success('Meal deleted successfully!');
      fetchMeals(); // Refresh the meals list
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal');
    }
  };

  const handleOpenMealForm = (mealType: string) => {
    setSelectedMealType(mealType);
    setShowMealForm(true);
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

  const mealsByType = meals.reduce((acc, meal) => {
    if (!acc[meal.mealType]) {
      acc[meal.mealType] = [];
    }
    acc[meal.mealType].push(meal);
    return acc;
  }, {} as Record<string, MealEntry[]>);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'drink'];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meals</h1>
            <p className="text-gray-600">Track your daily nutrition</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={() => handleOpenMealForm('lunch')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Meal
            </button>
          </div>
        </div>

        {/* Meal Sections */}
        <div className="space-y-6">
          {mealTypes.map((mealType) => (
            <div key={mealType} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 capitalize flex items-center">
                  <Utensils className="w-5 h-5 mr-2" />
                  {mealType}
                  {mealsByType[mealType] && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({mealsByType[mealType].reduce((sum, meal) => sum + meal.calories, 0)} cal)
                    </span>
                  )}
                </h3>
              </div>
              <div className="p-6">
                {mealsByType[mealType] && mealsByType[mealType].length > 0 ? (
                  <div className="space-y-3">
                    {mealsByType[mealType].map((meal) => (
                      <div key={meal._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{meal.name}</h4>
                          {meal.quantityGrams && (
                            <p className="text-sm text-gray-500">{meal.quantityGrams}g</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{meal.calories} cal</p>
                            {meal.createdAt && (
                              <p className="text-xs text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(meal.createdAt).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteMeal(meal._id!)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No {mealType} logged</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first {mealType}.</p>
                    <div className="mt-6">
                      <button 
                        onClick={() => handleOpenMealForm(mealType)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add {mealType}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Meal Form Modal */}
        <MealForm
          isOpen={showMealForm}
          onClose={() => setShowMealForm(false)}
          onSubmit={handleAddMeal}
          initialMealType={selectedMealType}
          initialDate={selectedDate}
        />
      </div>
    </Layout>
  );
};

export default MealsPage;
