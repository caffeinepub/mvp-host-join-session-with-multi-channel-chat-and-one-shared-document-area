import { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { processImageForSticker } from '../../lib/stickerImageProcessor';
import type { ProcessedSticker } from '../../lib/stickerImageProcessor';

type StickerUploadAreaProps = {
  onStickerProcessed: (sticker: ProcessedSticker) => void;
};

export default function StickerUploadArea({ onStickerProcessed }: StickerUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      const processed = await processImageForSticker(file);
      onStickerProcessed(processed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process image';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors min-h-[120px] flex flex-col items-center justify-center
          ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Processing image...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Click or drag to upload</p>
            <p className="text-xs text-muted-foreground mt-1">
              Any image format • Auto-resized to 128x128
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
