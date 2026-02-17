const QUICK_CHAT_PROFILE_KEY = 'rpg_quick_chat_profile';

export interface QuickChatProfile {
  displayName: string;
  avatarDataUrl: string;
}

export function loadQuickChatProfile(): QuickChatProfile | null {
  try {
    const stored = localStorage.getItem(QUICK_CHAT_PROFILE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    
    // Validate structure
    if (
      typeof parsed !== 'object' ||
      typeof parsed.displayName !== 'string' ||
      typeof parsed.avatarDataUrl !== 'string'
    ) {
      console.warn('Invalid quick chat profile structure, clearing');
      clearQuickChatProfile();
      return null;
    }

    // Validate data URL format
    if (parsed.avatarDataUrl && !parsed.avatarDataUrl.startsWith('data:image/')) {
      console.warn('Invalid avatar data URL format, clearing');
      clearQuickChatProfile();
      return null;
    }

    // Check size (prevent oversized storage)
    if (parsed.avatarDataUrl.length > 5_000_000) {
      console.warn('Avatar data URL too large, clearing');
      clearQuickChatProfile();
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load quick chat profile:', error);
    return null;
  }
}

export function saveQuickChatProfile(profile: QuickChatProfile): void {
  try {
    localStorage.setItem(QUICK_CHAT_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save quick chat profile:', error);
    throw new Error('Failed to save quick chat profile. Storage may be full.');
  }
}

export function clearQuickChatProfile(): void {
  try {
    localStorage.removeItem(QUICK_CHAT_PROFILE_KEY);
  } catch (error) {
    console.error('Failed to clear quick chat profile:', error);
  }
}
