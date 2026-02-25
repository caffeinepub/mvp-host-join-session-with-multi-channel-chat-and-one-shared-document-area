import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import Avatar from './Avatar';
import { validateImageFile, fileToBytes, createPreviewUrl } from '../../lib/imageValidation';

type ProfilePictureSectionProps = {
  currentImageUrl?: string;
  currentName: string;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
  onRemove: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
};

export default function ProfilePictureSection({
  currentImageUrl,
  currentName,
  onImageChange,
  onRemove,
  isUploading = false,
  uploadProgress = 0,
}: ProfilePictureSectionProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const url = createPreviewUrl(file);
      setPreviewUrl(url);
      onImageChange(file, url);
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('Failed to process image');
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="space-y-4">
      <Label>Profile Picture</Label>
      <div className="flex items-center gap-4">
        <Avatar imageUrl={displayUrl} name={currentName} size="lg" />
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="min-h-[44px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Picture
              </>
            )}
          </Button>
          {displayUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
              className="min-h-[44px]"
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        PNG or JPG, max 5MB
      </p>
    </div>
  );
}
