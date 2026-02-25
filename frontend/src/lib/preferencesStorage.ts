export type UserPreferences = {
  themeMode: 'light' | 'dark';
  backgroundImage: string | null;
  defaultNickname: string;
  uiScalePercent: number;
};

const PREFERENCES_KEY = 'rpg_user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  themeMode: 'light',
  backgroundImage: null,
  defaultNickname: '',
  uiScalePercent: 100,
};

export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    
    const parsed = JSON.parse(stored);
    
    // Clamp uiScalePercent to valid range
    let uiScalePercent = parsed.uiScalePercent ?? DEFAULT_PREFERENCES.uiScalePercent;
    if (typeof uiScalePercent === 'number') {
      uiScalePercent = Math.max(10, Math.min(200, uiScalePercent));
    } else {
      uiScalePercent = DEFAULT_PREFERENCES.uiScalePercent;
    }
    
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      uiScalePercent,
    };
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: UserPreferences): void {
  try {
    // Clamp uiScalePercent before saving
    const toSave = {
      ...preferences,
      uiScalePercent: Math.max(10, Math.min(200, preferences.uiScalePercent)),
    };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(toSave));
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
