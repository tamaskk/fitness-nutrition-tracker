import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Utensils, 
  Book, 
  Dumbbell, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  Check,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { PreferencesFormData } from '@/types';

const PreferencesPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PreferencesFormData>({
    defaultValues: {
      mealPlans: false,
      recipes: false,
      trainings: false,
      shoppingList: false,
      priceMonitor: false,
      finance: false,
    },
  });

  const watchedValues = watch();

  const preferences = [
    {
      key: 'mealPlans' as keyof PreferencesFormData,
      title: 'Meal Plans',
      description: 'Personalized meal planning and nutrition tracking',
      icon: Utensils,
      color: 'bg-green-500',
      emoji: '🥗',
    },
    {
      key: 'recipes' as keyof PreferencesFormData,
      title: 'Recipes',
      description: 'Discover and save delicious recipes',
      icon: Book,
      color: 'bg-orange-500',
      emoji: '🍳',
    },
    {
      key: 'trainings' as keyof PreferencesFormData,
      title: 'Trainings',
      description: 'Workout plans and fitness tracking',
      icon: Dumbbell,
      color: 'bg-blue-500',
      emoji: '🏋️',
    },
    {
      key: 'shoppingList' as keyof PreferencesFormData,
      title: 'Shopping List',
      description: 'Smart shopping lists and meal prep',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      emoji: '🛒',
    },
    {
      key: 'priceMonitor' as keyof PreferencesFormData,
      title: 'Price Monitor',
      description: 'Track prices and find the best deals',
      icon: TrendingUp,
      color: 'bg-yellow-500',
      emoji: '💰',
    },
    {
      key: 'finance' as keyof PreferencesFormData,
      title: 'Finance',
      description: 'Expense tracking and financial management',
      icon: DollarSign,
      color: 'bg-red-500',
      emoji: '📊',
    },
  ];

  const onSubmit = async (data: PreferencesFormData) => {
    // Check if at least one preference is selected
    const selectedPreferences = Object.values(data).filter(Boolean);
    if (selectedPreferences.length === 0) {
      toast.error('Please select at least one feature you\'d like to use');
      return;
    }

    setIsLoading(true);
    
    try {
      // Store preferences in sessionStorage for the onboarding flow
      sessionStorage.setItem('userPreferences', JSON.stringify(data));
      
      // Get the selected preferences for the next step
      const selectedKeys = Object.entries(data)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);
      
      toast.success('Preferences saved! Let\'s personalize your experience.');
      router.push('/onboarding/questions');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCount = Object.values(watchedValues).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Choose Your Features
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Select the features you'd like to use. You can always change these later.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {selectedCount} of {preferences.length} features selected
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {preferences.map((preference) => {
              const Icon = preference.icon;
              const isSelected = watchedValues[preference.key];
              
              return (
                <div key={preference.key} className="relative">
                  <input
                    {...register(preference.key)}
                    type="checkbox"
                    id={preference.key}
                    className="sr-only"
                  />
                  <label
                    htmlFor={preference.key}
                    className={`block p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${preference.color} flex items-center justify-center text-white text-xl`}>
                        {preference.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {preference.title}
                          </h3>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <Check className="h-5 w-5 text-blue-500" />
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {preference.description}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            
            <button
              type="submit"
              disabled={isLoading || selectedCount === 0}
              className="flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Continue'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Don't worry, you can always change these preferences later in your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
