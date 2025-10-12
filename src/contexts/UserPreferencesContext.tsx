import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface UserPreferences {
  mealPlans: boolean;
  recipes: boolean;
  trainings: boolean;
  shoppingList: boolean;
  priceMonitor: boolean;
  finance: boolean;
}

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  refreshPreferences: () => Promise<void>;
  updatePreference: (feature: string, enabled: boolean) => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (session?.user?.email) {
      try {
        setLoading(true);
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          console.log('Context: Fetched user preferences:', data.user.preferences);
          setPreferences(data.user.preferences);
        }
      } catch (error) {
        console.error('Failed to fetch user preferences:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const refreshPreferences = async () => {
    await fetchPreferences();
  };

  const updatePreference = async (feature: string, enabled: boolean) => {
    if (!preferences) return;

    try {
      const updatedPreferences = {
        ...preferences,
        [feature]: enabled,
      };

      console.log('Context: Updating preference:', feature, 'to', enabled);
      console.log('Context: New preferences:', updatedPreferences);

      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: updatedPreferences,
        }),
      });

      if (response.ok) {
        // Update local state immediately for instant UI feedback
        setPreferences(updatedPreferences);
        console.log('Context: Preference updated successfully');
      } else {
        console.error('Failed to update preference');
        // Revert on error
        await fetchPreferences();
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert on error
      await fetchPreferences();
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [session]);

  const value: UserPreferencesContextType = {
    preferences,
    loading,
    refreshPreferences,
    updatePreference,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
