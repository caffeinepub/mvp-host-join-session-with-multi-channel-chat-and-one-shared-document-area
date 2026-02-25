const STORAGE_KEYS = [
  'rpg_user_preferences',
  'rpg_session_context',
  'rpg_template_history',
  'rpg_quick_chat_profile',
  'rpg_hidden_my_communities',
];

export function clearLocalAppData(): void {
  try {
    // Clear specific app keys from localStorage
    STORAGE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key}:`, error);
      }
    });

    // Clear sessionStorage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }

    console.log('Local app data cleared successfully');
  } catch (error) {
    console.error('Failed to clear local app data:', error);
  }
}
