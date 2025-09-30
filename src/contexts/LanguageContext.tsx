import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hu';

// Simple translations object
const translations = {
  en: {
    'Dashboard': 'Dashboard',
    'Meals': 'Meals',
    'Recipes': 'Recipes',
    'Workouts': 'Workouts',
    'Shopping': 'Shopping',
    'Profile': 'Profile',
    'Sign out': 'Sign out',
    'Good morning': 'Good morning',
    'Good afternoon': 'Good afternoon',
    'Good evening': 'Good evening',
    'Here\'s your fitness summary for today': 'Here\'s your fitness summary for today',
    'Calories Consumed': 'Calories Consumed',
    'Calories Burned': 'Calories Burned',
    'Daily Goal': 'Daily Goal',
    'Balance': 'Balance',
    'Log Meal': 'Log Meal',
    'Log Workout': 'Log Workout',
    'Find Recipe': 'Find Recipe',
    'Shopping List': 'Shopping List',
    'Discover and save delicious recipes': 'Discover and save delicious recipes',
    'Search Recipes': 'Search Recipes',
    'Saved Recipes': 'Saved Recipes',
  },
  hu: {
    'Dashboard': 'Irányítópult',
    'Meals': 'Étkezések',
    'Recipes': 'Receptek',
    'Workouts': 'Edzések',
    'Shopping': 'Bevásárlás',
    'Profile': 'Profil',
    'Sign out': 'Kijelentkezés',
    'Good morning': 'Jó reggelt',
    'Good afternoon': 'Jó napot',
    'Good evening': 'Jó estét',
    'Here\'s your fitness summary for today': 'Itt a mai fitness összefoglalód',
    'Calories Consumed': 'Elfogyasztott kalóriák',
    'Calories Burned': 'Elégetett kalóriák',
    'Daily Goal': 'Napi cél',
    'Balance': 'Egyenleg',
    'Log Meal': 'Étkezés rögzítése',
    'Log Workout': 'Edzés rögzítése',
    'Find Recipe': 'Recept keresése',
    'Shopping List': 'Bevásárlólista',
    'Discover and save delicious recipes': 'Fedezz fel és ments el finom recepteket',
    'Search Recipes': 'Receptek keresése',
    'Saved Recipes': 'Mentett receptek',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('fitness-tracker-language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hu')) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fitness-tracker-language', language);
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
