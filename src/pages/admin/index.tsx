import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  Users, 
  UserPlus, 
  Activity, 
  TrendingUp, 
  Shield, 
  LogOut,
  Mail,
  Calendar,
  Weight,
  Ruler,
  Target,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Save,
  X,
  Globe,
  Languages,
  Settings,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { AdminStats, AdminUser } from '@/types';
import toast from 'react-hot-toast';
import { countries, languages } from 'countries-list';

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Helper functions to get country and language names
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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserDetails, setShowUserDetails] = useState<{ [key: string]: boolean }>({});
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AdminUser>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !session.user?.isAdmin) {
      router.push('/admin/login');
      return;
    }

    fetchStats();
  }, [session, status, router]);

  // Filter and search users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Feature filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(user => user.preferences[filterBy as keyof typeof user.preferences]);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterBy]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setUsers(data.users || []);
      } else {
        toast.error('Failed to fetch admin data');
      }
    } catch (error) {
      toast.error('Error loading admin dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  const toggleUserDetails = (userId: string) => {
    setShowUserDetails(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user._id);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: user.country,
      language: user.language,
      birthday: user.birthday,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      dailyCalorieGoal: user.dailyCalorieGoal,
      preferences: user.preferences,
    });
  };

  const handleSaveEdit = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setEditingUser(null);
        setEditForm({});
        fetchStats(); // Refresh data
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      toast.error('Error updating user');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchStats(); // Refresh data
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || !session.user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Users</option>
                <option value="mealPlans">🥗 Meal Plans</option>
                <option value="recipes">🍳 Recipes</option>
                <option value="trainings">🏋️ Trainings</option>
                <option value="shoppingList">🛒 Shopping List</option>
                <option value="priceMonitor">💰 Price Monitor</option>
                <option value="finance">📊 Finance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserPlus className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">New This Month</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.newUsersThisMonth}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active This Week</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activeUsersThisWeek}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Average Age</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.averageAge ? `${stats.averageAge} years` : 'N/A'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gender Distribution */}
        {stats && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Gender Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.genderDistribution.male}</div>
                  <div className="text-sm text-gray-500">Male</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{stats.genderDistribution.female}</div>
                  <div className="text-sm text-gray-500">Female</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.genderDistribution.other}</div>
                  <div className="text-sm text-gray-500">Other</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Registered Users ({filteredUsers.length} of {users.length})
              </h3>
              <div className="text-sm text-gray-500">
                {searchTerm && `Searching: "${searchTerm}"`}
                {filterBy !== 'all' && ` • Filtered by: ${filterBy}`}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <React.Fragment key={user._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.gender && user.birthday ? (
                                  `${user.gender}, ${new Date().getFullYear() - new Date(user.birthday).getFullYear()} years`
                                ) : user.gender ? (
                                  user.gender
                                ) : 'No profile info'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getCountryName(user.country)}</div>
                          <div className="text-sm text-gray-500">{getLanguageName(user.language)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleUserDetails(user._id)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              {showUserDetails[user._id] ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id, user.email)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {showUserDetails[user._id] && (
                        <tr className="bg-gray-50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="space-y-4">
                              {/* Preferences */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Features:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(user.preferences).map(([key, value]) => 
                                    value && (
                                      <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {key === 'mealPlans' && '🥗 Meal Plans'}
                                        {key === 'recipes' && '🍳 Recipes'}
                                        {key === 'trainings' && '🏋️ Trainings'}
                                        {key === 'shoppingList' && '🛒 Shopping List'}
                                        {key === 'priceMonitor' && '💰 Price Monitor'}
                                        {key === 'finance' && '📊 Finance'}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Notification Preferences */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Notification Preferences:</h4>
                                <div className="space-y-2">
                                  {Object.entries(user.preferences).map(([key, value]) => 
                                    value && user.onboardingAnswers?.[key as keyof typeof user.onboardingAnswers]?.notifications && (
                                      <div key={key} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">
                                          {key === 'mealPlans' && '🥗 Meal Plans'}
                                          {key === 'recipes' && '🍳 Recipes'}
                                          {key === 'trainings' && '🏋️ Trainings'}
                                          {key === 'shoppingList' && '🛒 Shopping List'}
                                          {key === 'priceMonitor' && '💰 Price Monitor'}
                                          {key === 'finance' && '📊 Finance'}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          user.onboardingAnswers[key as keyof typeof user.onboardingAnswers]?.notifications === 'email' ? 'bg-green-100 text-green-800' :
                                          user.onboardingAnswers[key as keyof typeof user.onboardingAnswers]?.notifications === 'in-app' ? 'bg-blue-100 text-blue-800' :
                                          user.onboardingAnswers[key as keyof typeof user.onboardingAnswers]?.notifications === 'both' ? 'bg-purple-100 text-purple-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {user.onboardingAnswers[key as keyof typeof user.onboardingAnswers]?.notifications === 'email' && '📧 Email'}
                                          {user.onboardingAnswers[key as keyof typeof user.onboardingAnswers]?.notifications === 'in-app' && '🔔 In-app'}
                                          {user.onboardingAnswers[key as keyof typeof user.onboardingAnswers]?.notifications === 'both' && '📱 Both'}
                                          {user.onboardingAnswers[key as keyof typeof user.onboardingAnswers]?.notifications === 'none' && '🚫 None'}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                              
                              {/* Profile Info */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                {user.birthday && (
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">
                                      Birthday: {new Date(user.birthday).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                {user.weight?.value && (
                                  <div className="flex items-center">
                                    <Weight className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">
                                      Weight: {user.weight.value} {user.weight.unit}
                                    </span>
                                  </div>
                                )}
                                {user.height?.value && (
                                  <div className="flex items-center">
                                    <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">
                                      Height: {user.height.value} {user.height.unit}
                                    </span>
                                  </div>
                                )}
                                {user.dailyCalorieGoal && (
                                  <div className="flex items-center">
                                    <Target className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">Calorie Goal: {user.dailyCalorieGoal}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Edit Form Modal */}
                      {editingUser === user._id && (
                        <tr className="bg-blue-50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-gray-900">Edit User</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                                  <input
                                    type="text"
                                    value={editForm.firstName || ''}
                                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                  <input
                                    type="text"
                                    value={editForm.lastName || ''}
                                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Email</label>
                                  <input
                                    type="email"
                                    value={editForm.email || ''}
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Country</label>
                                  <select
                                    value={editForm.country || ''}
                                    onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
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
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Language</label>
                                  <select
                                    value={editForm.language || ''}
                                    onChange={(e) => setEditForm({...editForm, language: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                  >
                                    <option value="">Select language</option>
                                    <option value="en">English</option>
                                    <option value="de">German</option>
                                    <option value="fr">French</option>
                                    <option value="nl">Dutch</option>
                                    <option value="hu">Hungarian</option>
                                    <option value="es">Spanish</option>
                                    <option value="pt">Portuguese</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Birthday</label>
                                  <input
                                    type="date"
                                    value={editForm.birthday ? new Date(editForm.birthday).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setEditForm({...editForm, birthday: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                                  <select
                                    value={editForm.gender || ''}
                                    onChange={(e) => setEditForm({...editForm, gender: e.target.value as any})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                  >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Weight</label>
                                  <div className="flex space-x-2">
                                    <input
                                      type="number"
                                      value={editForm.weight?.value || ''}
                                      onChange={(e) => setEditForm({
                                        ...editForm, 
                                        weight: {
                                          ...editForm.weight,
                                          value: parseFloat(e.target.value)
                                        }
                                      })}
                                      className="mt-1 flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                      placeholder="Weight"
                                    />
                                    <select
                                      value={editForm.weight?.unit || 'kg'}
                                      onChange={(e) => setEditForm({
                                        ...editForm,
                                        weight: {
                                          ...editForm.weight,
                                          unit: e.target.value as 'kg' | 'lbs'
                                        }
                                      })}
                                      className="mt-1 w-20 border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                    >
                                      <option value="kg">kg</option>
                                      <option value="lbs">lbs</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Height</label>
                                  <div className="flex space-x-2">
                                    <input
                                      type="number"
                                      value={editForm.height?.value || ''}
                                      onChange={(e) => setEditForm({
                                        ...editForm,
                                        height: {
                                          ...editForm.height,
                                          value: parseInt(e.target.value)
                                        }
                                      })}
                                      className="mt-1 flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                      placeholder="Height"
                                    />
                                    <select
                                      value={editForm.height?.unit || 'cm'}
                                      onChange={(e) => setEditForm({
                                        ...editForm,
                                        height: {
                                          ...editForm.height,
                                          unit: e.target.value as 'cm' | 'ft'
                                        }
                                      })}
                                      className="mt-1 w-20 border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                    >
                                      <option value="cm">cm</option>
                                      <option value="ft">ft</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Daily Calorie Goal</label>
                                  <input
                                    type="number"
                                    value={editForm.dailyCalorieGoal || ''}
                                    onChange={(e) => setEditForm({...editForm, dailyCalorieGoal: parseInt(e.target.value)})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                  />
                                </div>
                              </div>
                              
                              {/* Preferences Checkboxes */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Feature Preferences</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {Object.entries(editForm.preferences || {}).map(([key, value]) => (
                                    <label key={key} className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => setEditForm({
                                          ...editForm,
                                          preferences: {
                                            ...editForm.preferences,
                                            [key]: e.target.checked
                                          }
                                        })}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                      />
                                      <span className="ml-2 text-sm text-gray-700">
                                        {key === 'mealPlans' && '🥗 Meal Plans'}
                                        {key === 'recipes' && '🍳 Recipes'}
                                        {key === 'trainings' && '🏋️ Trainings'}
                                        {key === 'shoppingList' && '🛒 Shopping List'}
                                        {key === 'priceMonitor' && '💰 Price Monitor'}
                                        {key === 'finance' && '📊 Finance'}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <X className="h-4 w-4 mr-1 inline" />
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(user._id)}
                                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                                >
                                  <Save className="h-4 w-4 mr-1 inline" />
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
