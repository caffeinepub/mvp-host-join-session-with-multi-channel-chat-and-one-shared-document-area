import { useState, useEffect } from 'react';
import { loadStickers, addSticker, removeSticker, type StickerData } from '../lib/stickerStorage';

export function useLocalStickers() {
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const loaded = loadStickers();
      setStickers(loaded);
    } catch (error) {
      console.error('Failed to load stickers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const add = (sticker: StickerData) => {
    try {
      const updated = addSticker(sticker);
      setStickers(updated);
    } catch (error) {
      console.error('Failed to add sticker:', error);
      throw error;
    }
  };

  const remove = (id: string) => {
    try {
      const updated = removeSticker(id);
      setStickers(updated);
    } catch (error) {
      console.error('Failed to remove sticker:', error);
      throw error;
    }
  };

  return {
    stickers,
    isLoading,
    addSticker: add,
    removeSticker: remove,
  };
}
