import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import StickerUploadArea from './StickerUploadArea';
import { useLocalStickers } from '../../hooks/useLocalStickers';
import type { ProcessedSticker } from '../../lib/stickerImageProcessor';

type StickerManagementPanelProps = {
  onClose: () => void;
};

export default function StickerManagementPanel({ onClose }: StickerManagementPanelProps) {
  const { stickers, addSticker, removeSticker } = useLocalStickers();
  const [activeTab, setActiveTab] = useState('my-stickers');

  const handleStickerProcessed = (processed: ProcessedSticker) => {
    const newSticker = {
      id: Date.now().toString(),
      name: `Sticker ${stickers.length + 1}`,
      dataUrl: processed.dataUrl,
    };

    try {
      addSticker(newSticker);
      setActiveTab('my-stickers');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add sticker');
    }
  };

  const handleRemoveSticker = (id: string) => {
    if (confirm('Remove this sticker?')) {
      try {
        removeSticker(id);
      } catch (error) {
        alert('Failed to remove sticker');
      }
    }
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg z-50 max-w-md mx-auto">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-semibold text-sm">Sticker Manager</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px]"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="my-stickers" className="min-h-[44px]">
            My Stickers ({stickers.length})
          </TabsTrigger>
          <TabsTrigger value="upload" className="min-h-[44px]">
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-stickers" className="p-3">
          <ScrollArea className="h-[240px]">
            {stickers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No stickers yet. Upload some to get started!
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {stickers.map((sticker) => (
                  <div key={sticker.id} className="relative group">
                    <img
                      src={sticker.dataUrl}
                      alt={sticker.name}
                      className="w-full aspect-square rounded-lg border border-border object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveSticker(sticker.id)}
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="upload" className="p-3">
          <StickerUploadArea onStickerProcessed={handleStickerProcessed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
