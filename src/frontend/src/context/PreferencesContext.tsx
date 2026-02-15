import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  loadPreferences,
  savePreferences,
  resetPreferences,
  type UserPreferences,
} from '../lib/preferencesStorage';

type PreferencesContextType = {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  reset: () => void;
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences());

  // Apply theme changes immediately to document
  useEffect(() => {
    if (preferences.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.themeMode]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    savePreferences(newPreferences);
    setPreferences(newPreferences);
  };

  const reset = () => {
    const defaultPrefs = resetPreferences();
    setPreferences(defaultPrefs);
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, reset }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
