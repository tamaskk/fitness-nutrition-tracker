import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Utensils,
  Book,
  Dumbbell,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Mail,
  Bell,
  Smartphone
} from 'lucide-react';
import { OnboardingAnswersFormData, PreferencesFormData } from '@/types';

const OnboardingQuestionsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [userPreferences, setUserPreferences] = useState<PreferencesFormData | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OnboardingAnswersFormData>({
    defaultValues: {
      mealPlans: {
        goal: '',
        cookingTime: '',
        dietaryRestrictions: '',
        notifications: 'none',
      },
      recipes: {
        recipeType: '',
        cookingFrequency: '',
        priority: '',
        notifications: 'none',
      },
      trainings: {
        fitnessGoal: '',
        trainingLocation: '',
        trainingFrequency: '',
        notifications: 'none',
      },
      shoppingList: {
        planningStyle: '',
        shoppingPriority: '',
        shoppingFrequency: '',
        notifications: 'none',
      },
      priceMonitor: {
        productsToTrack: '',
        priceComparisonPriority: '',
        priceCheckFrequency: '',
        notifications: 'none',
      },
      finance: {
        financialGoal: '',
        currentManagement: '',
        toolImportance: '',
        notifications: 'none',
      },
    },
  });

  useEffect(() => {
    // Get preferences from sessionStorage
    const storedPreferences = sessionStorage.getItem('userPreferences');
    if (storedPreferences) {
      setUserPreferences(JSON.parse(storedPreferences));
    } else {
      // If no preferences found, redirect back
      router.push('/onboarding/preferences');
    }
  }, [router]);

  const selectedPreferences = userPreferences 
    ? Object.entries(userPreferences).filter(([_, value]) => value).map(([key, _]) => key)
    : [];

  const sections = [
    {
      key: 'mealPlans',
      title: '🥗 Meal Plans',
      icon: Utensils,
      color: 'text-green-600',
      questions: [
        {
          key: 'goal',
          question: "What's your goal with the meal plan?",
          options: [
            'Follow a specific diet',
            'Watch my daily calories',
            'Gain muscle',
            'Lose weight',
            'Eat healthier overall'
          ]
        },
        {
          key: 'cookingTime',
          question: 'How much time do you want to spend cooking per day?',
          options: [
            'Less than 15 minutes',
            '15–30 minutes',
            '30–60 minutes',
            'Over an hour',
            'I prefer ready or quick meals'
          ]
        },
        {
          key: 'dietaryRestrictions',
          question: 'Do you have any dietary preferences or restrictions?',
          options: [
            'Vegetarian',
            'Vegan',
            'Gluten-free',
            'High-protein',
            'No specific restriction'
          ]
        }
      ],
      notificationQuestion: 'Would you like to receive daily updates about your meal planning progress?'
    },
    {
      key: 'recipes',
      title: '🍳 Recipes',
      icon: Book,
      color: 'text-orange-600',
      questions: [
        {
          key: 'recipeType',
          question: 'What kind of recipes are you most interested in?',
          options: [
            'Quick and easy meals',
            'Healthy recipes',
            'High-protein meals',
            'Budget-friendly dishes',
            'Gourmet or special recipes'
          ]
        },
        {
          key: 'cookingFrequency',
          question: 'How often do you cook at home?',
          options: [
            'Every day',
            'A few times a week',
            'Once a week',
            'Occasionally',
            'Rarely'
          ]
        },
        {
          key: 'priority',
          question: "What's most important to you in a recipe?",
          options: [
            'Simplicity',
            'Nutrition value',
            'Taste and flavor',
            'Cooking time',
            'Cost per portion'
          ]
        }
      ],
      notificationQuestion: 'Would you like to receive notifications about new recipes and cooking tips?'
    },
    {
      key: 'trainings',
      title: '🏋️ Trainings',
      icon: Dumbbell,
      color: 'text-blue-600',
      questions: [
        {
          key: 'fitnessGoal',
          question: "What's your main fitness goal?",
          options: [
            'Lose fat',
            'Build muscle',
            'Improve endurance',
            'Stay active and healthy',
            'Improve mobility/flexibility'
          ]
        },
        {
          key: 'trainingLocation',
          question: 'Where do you usually train?',
          options: [
            'At the gym',
            'At home',
            'Outdoors',
            'Fitness classes',
            'I haven\'t started yet'
          ]
        },
        {
          key: 'trainingFrequency',
          question: 'How many times per week do you plan to train?',
          options: [
            '1–2 times',
            '3–4 times',
            '5 or more times',
            'Occasionally',
            'Not sure yet'
          ]
        }
      ],
      notificationQuestion: 'Would you like to receive workout reminders and fitness progress updates?'
    },
    {
      key: 'shoppingList',
      title: '🛒 Shopping List',
      icon: ShoppingCart,
      color: 'text-purple-600',
      questions: [
        {
          key: 'planningStyle',
          question: 'How do you usually plan your shopping?',
          options: [
            'I make a list before shopping',
            'I shop spontaneously',
            'I use a weekly plan',
            'I shop daily for fresh items',
            'I order online mostly'
          ]
        },
        {
          key: 'shoppingPriority',
          question: "What's your main shopping priority?",
          options: [
            'Healthy ingredients',
            'Saving money',
            'Convenience',
            'Local products',
            'Organic foods'
          ]
        },
        {
          key: 'shoppingFrequency',
          question: 'How often do you go grocery shopping?',
          options: [
            'Daily',
            '2–3 times a week',
            'Once a week',
            'Every two weeks',
            'Rarely — I order online'
          ]
        }
      ],
      notificationQuestion: 'Would you like to receive shopping reminders and list updates?'
    },
    {
      key: 'priceMonitor',
      title: '💰 Price Monitor',
      icon: TrendingUp,
      color: 'text-yellow-600',
      questions: [
        {
          key: 'productsToTrack',
          question: 'What products would you like to track prices for?',
          options: [
            'Groceries',
            'Electronics',
            'Clothing',
            'Household items',
            'All of the above'
          ]
        },
        {
          key: 'priceComparisonPriority',
          question: "What's most important when comparing prices?",
          options: [
            'Lowest price possible',
            'Product quality',
            'Brand reputation',
            'Delivery options',
            'Discount or promotion availability'
          ]
        },
        {
          key: 'priceCheckFrequency',
          question: 'How often do you check product prices?',
          options: [
            'Daily',
            'Weekly',
            'Monthly',
            'Only before big purchases',
            'Rarely'
          ]
        }
      ],
      notificationQuestion: 'Would you like to receive price alerts and deal notifications?'
    },
    {
      key: 'finance',
      title: '📊 Finance',
      icon: DollarSign,
      color: 'text-red-600',
      questions: [
        {
          key: 'financialGoal',
          question: "What's your main financial goal right now?",
          options: [
            'Save money',
            'Track expenses better',
            'Build an emergency fund',
            'Invest my savings',
            'Pay off debt'
          ]
        },
        {
          key: 'currentManagement',
          question: 'How do you currently manage your finances?',
          options: [
            'I use a budgeting app',
            'I track it manually',
            'I don\'t track it',
            'I rely on my bank\'s app',
            'Someone helps me with it'
          ]
        },
        {
          key: 'toolImportance',
          question: "What's most important to you in a finance tool?",
          options: [
            'Simplicity and ease of use',
            'Detailed analytics',
            'Goal setting and tracking',
            'Expense categorization',
            'Connecting with bank accounts'
          ]
        }
      ],
      notificationQuestion: 'Would you like to receive financial insights and spending alerts?'
    }
  ];

  // Filter sections based on user preferences
  const availableSections = sections.filter(section => 
    selectedPreferences.includes(section.key)
  );

  const currentSectionData = availableSections[currentSection];
  const isLastSection = currentSection === availableSections.length - 1;

  const onSubmit = async (data: OnboardingAnswersFormData) => {
    setIsLoading(true);
    
    try {
      // Store answers in sessionStorage
      sessionStorage.setItem('onboardingAnswers', JSON.stringify(data));
      
      // Get user email from registration data
      const registrationData = sessionStorage.getItem('registrationData');
      let userEmail = '';
      
      if (registrationData) {
        const parsedData = JSON.parse(registrationData);
        userEmail = parsedData.email;
      }
      
      // Update user preferences and answers in database
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: userPreferences,
          answers: data,
          userEmail: userEmail,
        }),
      });

      if (response.ok) {
        toast.success('Welcome to FitTracker! Your profile is set up.');
        // Clear session storage
        sessionStorage.removeItem('userPreferences');
        sessionStorage.removeItem('onboardingAnswers');
        sessionStorage.removeItem('registrationData');
        router.push('/login');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (isLastSection) {
      handleSubmit(onSubmit)();
    } else {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection === 0) {
      router.push('/onboarding/preferences');
    } else {
      setCurrentSection(prev => prev - 1);
    }
  };

  if (!userPreferences || availableSections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Personalize Your Experience
            </h2>
            <span className="text-sm text-gray-500">
              {currentSection + 1} of {availableSections.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / availableSections.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className={`p-3 rounded-lg bg-gray-100 ${currentSectionData.color}`}>
              <currentSectionData.icon className="h-6 w-6" />
            </div>
            <h3 className="ml-4 text-xl font-semibold text-gray-900">
              {currentSectionData.title}
            </h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {currentSectionData.questions.map((question, questionIndex) => (
              <div key={question.key} className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {question.question}
                </h4>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        {...register(`${currentSectionData.key}.${question.key}` as any, {
                          required: 'Please select an option',
                        })}
                        type="radio"
                        value={option}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors[currentSectionData.key as keyof OnboardingAnswersFormData]?.[question.key as any] && (
                  <p className="text-sm text-red-600">
                    {errors[currentSectionData.key as keyof OnboardingAnswersFormData]?.[question.key as any]?.message}
                  </p>
                )}
              </div>
            ))}

            {/* Notification Preferences */}
            <div className="border-t pt-6 mt-8">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {currentSectionData.notificationQuestion}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      {...register(`${currentSectionData.key}.notifications` as any)}
                      type="radio"
                      value="email"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-700">Email</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      {...register(`${currentSectionData.key}.notifications` as any)}
                      type="radio"
                      value="in-app"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <Bell className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-700">In-app</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      {...register(`${currentSectionData.key}.notifications` as any)}
                      type="radio"
                      value="both"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <Smartphone className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-700">Both</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      {...register(`${currentSectionData.key}.notifications` as any)}
                      type="radio"
                      value="none"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="text-gray-700">No notifications</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </form>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentSection === 0 ? 'Back to Preferences' : 'Previous'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : isLastSection ? 'Complete Setup' : 'Next'}
              {!isLastSection && <ArrowRight className="h-4 w-4 ml-2" />}
              {isLastSection && <Check className="h-4 w-4 ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuestionsPage;
