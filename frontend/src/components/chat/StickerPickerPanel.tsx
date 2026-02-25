import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useLocalStickers } from '../../hooks/useLocalStickers';
import type { StickerData } from '../../lib/stickerStorage';

type StickerPickerPanelProps = {
  onClose: () => void;
  onStickerSelect: (sticker: StickerData) => void;
};

export default function StickerPickerPanel({ onClose, onStickerSelect }: StickerPickerPanelProps) {
  const { stickers, isLoading } = useLocalStickers();

  const handleStickerClick = (sticker: StickerData) => {
    onStickerSelect(sticker);
    onClose();
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg z-50 max-w-md mx-auto">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-semibold text-sm">Pick a Sticker</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px]"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[240px] p-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Loading stickers...
          </div>
        ) : stickers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No stickers available. Add some in the Sticker Manager!
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {stickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleStickerClick(sticker)}
                className="aspect-square rounded-lg border border-border hover:border-primary transition-colors overflow-hidden min-h-[64px] min-w-[64px]"
              >
                <img
                  src={sticker.dataUrl}
                  alt={sticker.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
