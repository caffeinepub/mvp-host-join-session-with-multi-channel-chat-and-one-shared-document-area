import { useState, useEffect } from 'react';
import {
  loadQuickChatProfile,
  saveQuickChatProfile,
  clearQuickChatProfile,
  type QuickChatProfile,
} from '../lib/quickChatProfileStorage';

export function useQuickChatProfile() {
  const [profile, setProfile] = useState<QuickChatProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const loaded = loadQuickChatProfile();
      setProfile(loaded);
    } catch (error) {
      console.error('Error loading quick chat profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = (newProfile: QuickChatProfile) => {
    try {
      saveQuickChatProfile(newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error('Error saving quick chat profile:', error);
      throw error;
    }
  };

  const clear = () => {
    try {
      clearQuickChatProfile();
      setProfile(null);
    } catch (error) {
      console.error('Error clearing quick chat profile:', error);
    }
  };

  return {
    profile,
    isLoading,
    save,
    clear,
  };
}
