export type UserPreferences = {
  themeMode: 'light' | 'dark';
  backgroundImage: string | null;
  defaultNickname: string;
  uiScale: number;
};

const PREFERENCES_KEY = 'rpg_user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  themeMode: 'light',
  backgroundImage: null,
  defaultNickname: '',
  uiScale: 100,
};

const MIN_UI_SCALE = 10;
const MAX_UI_SCALE = 200;

export function clampUiScale(scale: number): number {
  return Math.max(MIN_UI_SCALE, Math.min(MAX_UI_SCALE, scale));
}

export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    
    const parsed = JSON.parse(stored);
    const preferences = {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
    
    // Clamp uiScale to valid range
    if (typeof preferences.uiScale === 'number') {
      preferences.uiScale = clampUiScale(preferences.uiScale);
    }
    
    return preferences;
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: UserPreferences): void {
  try {
    // Clamp uiScale before saving
    const clampedPreferences = {
      ...preferences,
      uiScale: clampUiScale(preferences.uiScale),
    };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(clampedPreferences));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

export function resetPreferences(): UserPreferences {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error('Failed to reset preferences:', error);
  }
  return DEFAULT_PREFERENCES;
}
