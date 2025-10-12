import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Settings, 
  Trash2,
  Utensils,
  Book,
  Dumbbell,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Mail,
  Bell,
  Smartphone,
  Calendar,
  Weight,
  Ruler,
  Target,
  Globe,
  Languages,
  Heart,
  AlertTriangle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User as UserType, PreferencesFormData, OnboardingAnswersFormData } from '@/types';
import { countries, languages } from 'countries-list';
import OnboardingModal from '@/components/OnboardingModal';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
  
  const { preferences, updatePreference } = useUserPreferences();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserType>();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordFormSubmit,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();

  const password = watchPassword('newPassword');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
    else fetchUserData();
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        // Debug logging
        console.log('User data loaded:', data.user);
        console.log('Onboarding answers:', data.user.onboardingAnswers);
        
        // Set form values
        const user = data.user;
        setValue('firstName', user.firstName);
        setValue('lastName', user.lastName);
        setValue('email', user.email);
        setValue('country', user.country);
        setValue('language', user.language);
        setValue('birthday', user.birthday);
        setValue('gender', user.gender);
        setValue('weight', user.weight);
        setValue('height', user.height);
        setValue('dailyCalorieGoal', user.dailyCalorieGoal);
      }
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (data: UserType) => {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        fetchUserData();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  const handlePasswordSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Password updated successfully');
        setShowPasswordForm(false);
      } else {
        toast.error('Failed to update password');
      }
    } catch (error) {
      toast.error('Error updating password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        await signOut({ callbackUrl: '/signup' });
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      toast.error('Error deleting account');
    }
  };

  const handleOnboardingSubmit = async (feature: string, answers: any) => {
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature,
          answers,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Onboarding API response:', result);
        toast.success('Onboarding answers saved');
        setShowOnboarding(null);
        fetchUserData();
      } else {
        const error = await response.json();
        console.log('Onboarding API error:', error);
        toast.error('Failed to save answers');
      }
    } catch (error) {
      toast.error('Error saving answers');
    }
  };

  const handlePreferenceToggle = async (feature: string, enabled: boolean) => {
    if (isUpdatingPreferences) return;
    
    setIsUpdatingPreferences(true);
    try {
      await updatePreference(feature, enabled);
      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`);
      fetchUserData(); // Refresh user data to get updated onboarding answers
    } catch (error) {
      toast.error('Error updating preferences');
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  const getCountryName = (code: string) => {
    return countries[code as keyof typeof countries]?.name || code;
  };

  const getLanguageName = (code: string) => {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'de': 'German',
      'fr': 'French',
      'nl': 'Dutch',
      'hu': 'Hungarian',
      'es': 'Spanish',
      'pt': 'Portuguese'
    };
    return languageNames[code] || code;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthday: Date | string) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const hasAnsweredQuestions = (feature: string) => {
    const answers = userData?.onboardingAnswers?.[feature as keyof typeof userData.onboardingAnswers];
    if (!answers) {
      console.log(`No answers found for ${feature}`);
      return false;
    }
    
    // Debug logging
    console.log(`Checking ${feature} answers:`, answers);
    console.log(`Answer keys:`, Object.keys(answers));
    console.log(`Answer values:`, Object.values(answers));
    
    // Check if any question has been answered (excluding notifications)
    const hasAnswers = Object.keys(answers).some(key => {
      const value = answers[key as keyof typeof answers];
      const hasValue = value && value !== null && value !== undefined && String(value).trim() !== '';
      console.log(`Key ${key} has value:`, value, '->', hasValue);
      return key !== 'notifications' && hasValue;
    });
    
    // Also check if notifications is set (this indicates the user completed the flow)
    const hasNotifications = answers.notifications && answers.notifications !== 'none';
    const hasAnyAnswer = hasAnswers || hasNotifications;
    
    // Special case: if notifications is set to something other than 'none', 
    // it means the user completed the onboarding flow
    if (hasNotifications) {
      console.log(`Feature ${feature} has completed onboarding (notifications set to: ${answers.notifications})`);
      return true;
    }    
    return hasAnyAnswer;
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!session || !userData) return null;

  return (
    <Layout>
      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative">
              <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {userData.firstName} {userData.lastName}
            </h1>
            <p className="text-gray-600">{userData.email}</p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Globe className="h-4 w-4 mr-1" />
              {getCountryName(userData.country)} • {getLanguageName(userData.language)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('firstName', { required: 'First name is required' })}
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('lastName', { required: 'Last name is required' })}
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        type="email"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('country', { required: 'Country is required' })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select country</option>
                          {Object.entries(countries)
                            .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                            .map(([code, country]) => (
                              <option key={code} value={code}>
                                {country.name}
                              </option>
                            ))}
                        </select>
                        {errors.country && (
                          <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('language', { required: 'Language is required' })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="de">German</option>
                          <option value="fr">French</option>
                          <option value="nl">Dutch</option>
                          <option value="hu">Hungarian</option>
                          <option value="es">Spanish</option>
                          <option value="pt">Portuguese</option>
                        </select>
                        {errors.language && (
                          <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Birthday <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('birthday', { required: 'Birthday is required' })}
                          type="date"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.birthday && (
                          <p className="mt-1 text-sm text-red-600">{errors.birthday.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          {...register('gender')}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                        <div className="flex space-x-2">
                          <input
                            {...register('weight.value')}
                            type="number"
                            placeholder="Weight"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <select
                            {...register('weight.unit')}
                            className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="kg">kg</option>
                            <option value="lbs">lbs</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                        <div className="flex space-x-2">
                          <input
                            {...register('height.value')}
                            type="number"
                            placeholder="Height"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <select
                            {...register('height.unit')}
                            className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="cm">cm</option>
                            <option value="ft">ft</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Daily Calorie Goal</label>
                      <input
                        {...register('dailyCalorieGoal')}
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{userData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Birthday</p>
                          <p className="font-medium">
                            {formatDate(userData.birthday)} ({calculateAge(userData.birthday)} years old)
                          </p>
                        </div>
                      </div>
                      {userData.gender && (
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium capitalize">{userData.gender}</p>
                          </div>
                        </div>
                      )}
                      {userData.weight?.value && (
                        <div className="flex items-center">
                          <Weight className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Weight</p>
                            <p className="font-medium">{userData.weight.value} {userData.weight.unit}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Country</p>
                          <p className="font-medium">{getCountryName(userData.country)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Languages className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Language</p>
                          <p className="font-medium">{getLanguageName(userData.language)}</p>
                        </div>
                      </div>
                      {userData.height?.value && (
                        <div className="flex items-center">
                          <Ruler className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Height</p>
                            <p className="font-medium">{userData.height.value} {userData.height.unit}</p>
                          </div>
                        </div>
                      )}
                      {userData.dailyCalorieGoal && (
                        <div className="flex items-center">
                          <Target className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Daily Calorie Goal</p>
                            <p className="font-medium">{userData.dailyCalorieGoal} calories</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Preferences */}
              <div className="bg-white shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Feature Preferences</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {preferences && Object.entries(preferences).map(([key, enabled]) => {
                    const features = {
                      mealPlans: { name: 'Meal Plans', icon: Utensils, color: 'bg-green-500', emoji: '🥗' },
                      recipes: { name: 'Recipes', icon: Book, color: 'bg-orange-500', emoji: '🍳' },
                      trainings: { name: 'Trainings', icon: Dumbbell, color: 'bg-blue-500', emoji: '🏋️' },
                      shoppingList: { name: 'Shopping List', icon: ShoppingCart, color: 'bg-purple-500', emoji: '🛒' },
                      priceMonitor: { name: 'Price Monitor', icon: TrendingUp, color: 'bg-yellow-500', emoji: '💰' },
                      finance: { name: 'Finance', icon: DollarSign, color: 'bg-red-500', emoji: '📊' },
                    };
                    
                    const feature = features[key as keyof typeof features];
                    const Icon = feature.icon;
                    
                    return (
                      <div key={key} className={`p-4 rounded-lg border-2 ${enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${feature.color} text-white mr-3`}>
                              {feature.emoji}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{feature.name}</h3>
                              <p className={`text-sm ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
                                {enabled ? 'Enabled' : 'Disabled'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Toggle Switch */}
                          <div className="flex items-center">
                            <button
                              onClick={() => handlePreferenceToggle(key, !enabled)}
                              disabled={isUpdatingPreferences}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                enabled ? 'bg-blue-600' : 'bg-gray-200'
                              } ${isUpdatingPreferences ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        
                        {enabled && (
                          <div className="space-y-2">
                            {/* Show notification preference if available */}
                            {userData.onboardingAnswers?.[key as keyof typeof userData.onboardingAnswers]?.notifications && (
                              <div className="flex items-center text-xs">
                                {userData.onboardingAnswers[key as keyof typeof userData.onboardingAnswers]?.notifications === 'email' && (
                                  <>
                                    <Mail className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-gray-600">Email notifications</span>
                                  </>
                                )}
                                {userData.onboardingAnswers[key as keyof typeof userData.onboardingAnswers]?.notifications === 'in-app' && (
                                  <>
                                    <Bell className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-gray-600">In-app notifications</span>
                                  </>
                                )}
                                {userData.onboardingAnswers[key as keyof typeof userData.onboardingAnswers]?.notifications === 'both' && (
                                  <>
                                    <Smartphone className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-gray-600">Email & in-app notifications</span>
                                  </>
                                )}
                                {userData.onboardingAnswers[key as keyof typeof userData.onboardingAnswers]?.notifications === 'none' && (
                                  <span className="text-gray-600">No notifications</span>
                                )}
                              </div>
                            )}
                            
                            {/* Show different button text based on whether questions have been answered */}
                            {!hasAnsweredQuestions(key) ? (
                              <button
                                onClick={() => setShowOnboarding(key)}
                                className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                              >
                                Answer Questions
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Actions */}
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Change Password
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>

              {/* Account Stats */}
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">{formatDate(userData.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Features enabled</span>
                    <span className="font-medium">
                      {Object.values(userData.preferences).filter(Boolean).length} of 6
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions answered</span>
                    <span className="font-medium">
                      {Object.values(userData.onboardingAnswers || {}).filter(answers => 
                        Object.values(answers).some(answer => answer)
                      ).length} features
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={!!showOnboarding}
        onClose={() => setShowOnboarding(null)}
        feature={showOnboarding || ''}
        onSubmit={handleOnboardingSubmit}
        existingAnswers={userData?.onboardingAnswers?.[showOnboarding as keyof typeof userData.onboardingAnswers]}
      />

      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordFormSubmit(handlePasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerPassword('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerPassword('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete your account? This action cannot be undone and will permanently remove:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Your profile information</li>
                <li>All your preferences and settings</li>
                <li>Your meal plans and recipes</li>
                <li>Your workout history</li>
                <li>All other data associated with your account</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProfilePage;
