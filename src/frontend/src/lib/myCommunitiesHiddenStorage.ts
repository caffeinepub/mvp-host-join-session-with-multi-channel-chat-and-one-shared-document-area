const STORAGE_KEY = 'rpg_hidden_my_communities';

export function loadHiddenCommunityIds(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Set();
    
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((id) => typeof id === 'string'));
    }
    return new Set();
  } catch (error) {
    console.error('Failed to load hidden community IDs:', error);
    return new Set();
  }
}

export function saveHiddenCommunityIds(hiddenIds: Set<string>): void {
  try {
    const array = Array.from(hiddenIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
  } catch (error) {
    console.error('Failed to save hidden community IDs:', error);
  }
}

export function addHiddenCommunityId(id: string): void {
  const hiddenIds = loadHiddenCommunityIds();
  hiddenIds.add(id);
  saveHiddenCommunityIds(hiddenIds);
}

export function removeHiddenCommunityId(id: string): void {
  const hiddenIds = loadHiddenCommunityIds();
  hiddenIds.delete(id);
  saveHiddenCommunityIds(hiddenIds);
}

export function clearHiddenCommunityIds(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear hidden community IDs:', error);
  }
}
