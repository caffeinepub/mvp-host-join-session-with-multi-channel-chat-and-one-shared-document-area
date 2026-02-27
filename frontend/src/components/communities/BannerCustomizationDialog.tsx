import React, { useState, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActor } from '../../hooks/useActor';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const FONT_OPTIONS = [
  { value: 'sans', label: 'Sans-serif (Modern)' },
  { value: 'serif', label: 'Serif (Classic)' },
  { value: 'mono', label: 'Monospace (Tech)' },
  { value: 'display', label: 'Display (Bold)' },
];

interface BannerSettings {
  bannerBlob?: Uint8Array;
  bannerColor?: string;
  bannerFont?: string;
  accentColor?: string;
  bannerUrl?: string;
}

interface BannerCustomizationDialogProps {
  communityId: string;
  currentSettings: BannerSettings;
  onClose: () => void;
  onSaved: (settings: BannerSettings) => void;
}

export default function BannerCustomizationDialog({
  communityId,
  currentSettings,
  onClose,
  onSaved,
}: BannerCustomizationDialogProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [bannerColor, setBannerColor] = useState(currentSettings.bannerColor || '#1a1a2e');
  const [accentColor, setAccentColor] = useState(currentSettings.accentColor || '#7c3aed');
  const [bannerFont, setBannerFont] = useState(currentSettings.bannerFont || 'sans');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | undefined>(currentSettings.bannerUrl);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');

      let bannerBytes: Uint8Array | null = null;

      if (bannerFile) {
        const arrayBuffer = await bannerFile.arrayBuffer();
        bannerBytes = new Uint8Array(arrayBuffer);
      }

      await actor.updateBannerSettings(
        communityId,
        bannerBytes,
        bannerColor,
        bannerFont,
        accentColor,
      );

      return { bannerBytes, bannerColor, bannerFont, accentColor };
    },
    onSuccess: (result) => {
      const newSettings: BannerSettings = {
        bannerColor: result.bannerColor,
        bannerFont: result.bannerFont,
        accentColor: result.accentColor,
        bannerUrl: bannerPreviewUrl,
      };
      if (result.bannerBytes) {
        newSettings.bannerBlob = result.bannerBytes;
      }
      onSaved(newSettings);
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to save banner settings');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Only PNG and JPG images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    setError(null);
    setBannerFile(file);
    const url = URL.createObjectURL(file);
    setBannerPreviewUrl(url);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Customize Banner</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Banner Preview */}
          <div
            className="w-full h-32 rounded-lg overflow-hidden relative"
            style={{
              background: bannerPreviewUrl
                ? `url(${bannerPreviewUrl}) center/cover no-repeat`
                : bannerColor,
            }}
          >
            <div className="absolute inset-0 bg-black/30 flex items-end p-3">
              <span
                className={`text-white font-bold text-lg ${
                  bannerFont === 'serif' ? 'font-serif' :
                  bannerFont === 'mono' ? 'font-mono' : 'font-sans'
                }`}
              >
                Community Name
              </span>
            </div>
          </div>

          {/* Banner Image Upload */}
          <div className="space-y-2">
            <Label>Banner Image (PNG/JPG, max 5MB)</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                {bannerFile ? bannerFile.name : 'Upload Image'}
              </Button>
              {bannerPreviewUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBannerFile(null);
                    setBannerPreviewUrl(undefined);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Banner Color */}
          <div className="space-y-2">
            <Label>Banner Background Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bannerColor}
                onChange={(e) => setBannerColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-border"
              />
              <span className="text-sm text-muted-foreground font-mono">{bannerColor}</span>
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-border"
              />
              <span className="text-sm text-muted-foreground font-mono">{accentColor}</span>
            </div>
          </div>

          {/* Font Selection */}
          <div className="space-y-2">
            <Label>Title Font</Label>
            <Select value={bannerFont} onValueChange={setBannerFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saveMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            style={{ backgroundColor: accentColor }}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
