import { useState } from 'react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { validateImageFile } from '../../../lib/imageValidation';
import { useCommunityImageUpload } from '../../../hooks/useCommunityImageUpload';

type CommunityImagePickersProps = {
  coverImage?: File;
  coverUrl?: string;
  iconImage?: File;
  iconUrl?: string;
  bannerImage?: File;
  bannerUrl?: string;
  onCoverChange: (file: File | undefined, url: string | undefined) => void;
  onIconChange: (file: File | undefined, url: string | undefined) => void;
  onBannerChange: (file: File | undefined, url: string | undefined) => void;
};

export default function CommunityImagePickers({
  coverImage,
  coverUrl,
  iconImage,
  iconUrl,
  bannerImage,
  bannerUrl,
  onCoverChange,
  onIconChange,
  onBannerChange,
}: CommunityImagePickersProps) {
  const { uploadImage, isUploading, uploadProgress } = useCommunityImageUpload();
  const [uploadingType, setUploadingType] = useState<'cover' | 'icon' | 'banner' | null>(null);

  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cover' | 'icon' | 'banner',
    onChange: (file: File | undefined, url: string | undefined) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploadingType(type);

    try {
      const url = await uploadImage(file);
      onChange(file, url);
    } catch (error) {
      console.error(`Failed to upload ${type} image:`, error);
      alert(`Failed to upload ${type} image`);
    } finally {
      setUploadingType(null);
    }
  };

  const handleRemove = (
    type: 'cover' | 'icon' | 'banner',
    onChange: (file: File | undefined, url: string | undefined) => void
  ) => {
    onChange(undefined, undefined);
  };

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <p className="text-sm text-muted-foreground">
          Main image for your community (also used as icon in lists)
        </p>
        {coverUrl ? (
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-border">
            <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 min-h-[44px] min-w-[44px]"
              onClick={() => handleRemove('cover', onCoverChange)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="block">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => handleImageSelect(e, 'cover', onCoverChange)}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px]"
              disabled={isUploading}
              onClick={(e) => {
                e.preventDefault();
                (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
              }}
            >
              {uploadingType === 'cover' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Cover Image
                </>
              )}
            </Button>
          </label>
        )}
      </div>

      {/* Community Icon */}
      <div className="space-y-2">
        <Label>Community Icon (Optional)</Label>
        <p className="text-sm text-muted-foreground">
          Square icon for notifications and small displays
        </p>
        {iconUrl ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
            <img src={iconUrl} alt="Icon preview" className="w-full h-full object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-8 w-8 min-h-[44px] min-w-[44px]"
              onClick={() => handleRemove('icon', onIconChange)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <label className="block">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => handleImageSelect(e, 'icon', onIconChange)}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px]"
              disabled={isUploading}
              onClick={(e) => {
                e.preventDefault();
                (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
              }}
            >
              {uploadingType === 'icon' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Community Icon (Optional)
                </>
              )}
            </Button>
          </label>
        )}
      </div>

      {/* Community Banner */}
      <div className="space-y-2">
        <Label>Community Banner (Optional)</Label>
        <p className="text-sm text-muted-foreground">
          Wide banner for community page header
        </p>
        {bannerUrl ? (
          <div className="relative w-full aspect-[16/5] rounded-lg overflow-hidden border border-border">
            <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 min-h-[44px] min-w-[44px]"
              onClick={() => handleRemove('banner', onBannerChange)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="block">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => handleImageSelect(e, 'banner', onBannerChange)}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px]"
              disabled={isUploading}
              onClick={(e) => {
                e.preventDefault();
                (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
              }}
            >
              {uploadingType === 'banner' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Community Banner (Optional)
                </>
              )}
            </Button>
          </label>
        )}
      </div>
    </div>
  );
}
