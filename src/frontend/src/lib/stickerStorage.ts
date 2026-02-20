// LocalStorage-backed storage for user stickers
export interface StickerData {
  id: string;
  name: string;
  dataUrl: string;
}

const STORAGE_KEY = 'rpg_user_stickers';
const MAX_STICKERS = 50;

export function loadStickers(): StickerData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s: any) => s.id && s.name && s.dataUrl);
  } catch (error) {
    console.error('Failed to load stickers:', error);
    return [];
  }
}

export function saveStickers(stickers: StickerData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stickers));
  } catch (error) {
    console.error('Failed to save stickers:', error);
    throw new Error('Failed to save stickers. Storage may be full.');
  }
}

export function addSticker(sticker: StickerData): StickerData[] {
  const stickers = loadStickers();
  if (stickers.length >= MAX_STICKERS) {
    throw new Error(`Maximum ${MAX_STICKERS} stickers allowed`);
  }
  const updated = [...stickers, sticker];
  saveStickers(updated);
  return updated;
}

export function removeSticker(id: string): StickerData[] {
  const stickers = loadStickers();
  const updated = stickers.filter((s) => s.id !== id);
  saveStickers(updated);
  return updated;
}

export function clearStickers(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stickers:', error);
  }
}
