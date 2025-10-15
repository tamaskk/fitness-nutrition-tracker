import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, ArrowRight, ArrowLeft, Check, Mail, Bell, Smartphone } from 'lucide-react';
import { OnboardingAnswersFormData } from '@/types';
import toast from 'react-hot-toast';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  onSubmit: (feature: string, answers: any) => void;
  existingAnswers?: any;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  feature,
  onSubmit,
  existingAnswers = {}
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<OnboardingAnswersFormData>({
    defaultValues: existingAnswers,
  });

  // Reset currentQuestion to 0 whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestion(0);
      // Reset form to only show existing answers for the current question
      reset(existingAnswers);
    }
  }, [isOpen, existingAnswers, reset]);

  const featureQuestions = {
    mealPlans: {
      title: '🥗 Meal Plans',
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
    recipes: {
      title: '🍳 Recipes',
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
    trainings: {
      title: '🏋️ Trainings',
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
    shoppingList: {
      title: '🛒 Shopping List',
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
    priceMonitor: {
      title: '💰 Price Monitor',
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
    finance: {
      title: '📊 Finance',
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
  };

  const currentFeature = featureQuestions[feature as keyof typeof featureQuestions];
  const isLastQuestion = currentFeature ? currentQuestion === currentFeature.questions.length : false;

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit(onFormSubmit)();
    } else {
      // Clear the current question's answer before moving to next
      if (currentFeature && currentFeature.questions[currentQuestion]) {
        const currentQuestionKey = currentFeature.questions[currentQuestion].key;
        setValue(`${feature}.${currentQuestionKey}` as any, '');
      }
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion === 0) {
      onClose();
    } else {
      // Clear the current question's answer before moving to previous
      if (currentFeature && currentFeature.questions[currentQuestion]) {
        const currentQuestionKey = currentFeature.questions[currentQuestion].key;
        setValue(`${feature}.${currentQuestionKey}` as any, '');
      }
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const onFormSubmit = async (data: OnboardingAnswersFormData) => {
    setIsSubmitting(true);
    try {
      console.log('OnboardingModal form data:', data);
      console.log('Feature-specific data:', data[feature as keyof OnboardingAnswersFormData]);
      await onSubmit(feature, data[feature as keyof OnboardingAnswersFormData]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !feature || !currentFeature) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-950 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:border dark:border-zinc-900">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentFeature.title}</h2>
              <p className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {currentFeature.questions.length + 1}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / (currentFeature.questions.length + 1)) * 100}%` }}
            ></div>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)}>
            {!isLastQuestion && currentFeature.questions[currentQuestion] ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentFeature.questions[currentQuestion].question}
                </h3>
                <div className="space-y-2">
                  {currentFeature.questions[currentQuestion].options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        {...register(`${feature}.${currentFeature.questions[currentQuestion].key}` as any, {
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
                {currentFeature.questions[currentQuestion] && (errors as any)[feature]?.[currentFeature.questions[currentQuestion].key] && (
                  <p className="text-sm text-red-600">
                    {(errors as any)[feature]?.[currentFeature.questions[currentQuestion].key]?.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentFeature.notificationQuestion}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      {...register(`${feature}.notifications` as any)}
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
                      {...register(`${feature}.notifications` as any)}
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
                      {...register(`${feature}.notifications` as any)}
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
                      {...register(`${feature}.notifications` as any)}
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
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-md hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentQuestion === 0 ? 'Cancel' : 'Previous'}
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : isLastQuestion ? 'Complete' : 'Next'}
                {!isLastQuestion && <ArrowRight className="h-4 w-4 ml-2" />}
                {isLastQuestion && <Check className="h-4 w-4 ml-2" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
