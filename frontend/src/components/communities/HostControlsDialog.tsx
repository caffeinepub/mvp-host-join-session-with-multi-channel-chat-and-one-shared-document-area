import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Community, ExternalBlob } from '../../backend';
import { useUpdateCommunitySettings } from '../../hooks/useQueries';
import MemberPermissionsPanel from './MemberPermissionsPanel';
import { Upload, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface HostControlsDialogProps {
  open: boolean;
  onClose: () => void;
  communityId: bigint;
  community: Community;
}

const FONT_OPTIONS = [
  { value: 'inherit', label: 'Default' },
  { value: "'Cinzel', serif", label: 'Cinzel (Fantasy)' },
  { value: "'Exo 2', sans-serif", label: 'Exo 2 (Sci-Fi)' },
  { value: "'Crimson Text', serif", label: 'Crimson Text (Classic)' },
  { value: "'Orbitron', sans-serif", label: 'Orbitron (Futuristic)' },
  { value: "'Uncial Antiqua', cursive", label: 'Uncial Antiqua (Medieval)' },
];

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export default function HostControlsDialog({
  open,
  onClose,
  communityId,
  community,
}: HostControlsDialogProps) {
  const updateSettings = useUpdateCommunitySettings(communityId);

  const [primaryColor, setPrimaryColor] = useState(community.primaryColor ?? '#7c3aed');
  const [accentColor, setAccentColor] = useState(community.accentColor ?? '#a78bfa');
  const [font, setFont] = useState(community.font ?? 'inherit');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    community.bannerImage ? community.bannerImage.getDirectURL() : null
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only PNG, JPG, GIF, and WEBP images are allowed.');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Banner image must be under 5MB.');
      return;
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    let bannerBlob: ExternalBlob | null = community.bannerImage ?? null;

    if (bannerFile) {
      const bytes = new Uint8Array(await bannerFile.arrayBuffer());
      bannerBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
    } else if (!bannerPreview) {
      bannerBlob = null;
    }

    updateSettings.mutate(
      {
        bannerImage: bannerBlob,
        primaryColor: primaryColor || null,
        accentColor: accentColor || null,
        font: font === 'inherit' ? null : font,
        layoutOptions: null,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === 'ok') {
            toast.success('Community settings saved!');
            setUploadProgress(0);
            onClose();
          } else {
            toast.error(result.error);
            setUploadProgress(0);
          }
        },
        onError: (err) => {
          toast.error('Failed to save settings: ' + err.message);
          setUploadProgress(0);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-cosmic-surface border-cosmic-border text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Host Controls</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appearance">
          <TabsList className="bg-white/5 border border-white/10 w-full">
            <TabsTrigger value="appearance" className="flex-1 data-[state=active]:bg-cosmic-accent data-[state=active]:text-white text-white/60">
              Appearance
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex-1 data-[state=active]:bg-cosmic-accent data-[state=active]:text-white text-white/60">
              Permissions
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-5 mt-4">
            {/* Banner Upload */}
            <div className="space-y-2">
              <Label className="text-white/80 text-sm font-medium">Banner Image</Label>
              {bannerPreview ? (
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-32 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    onClick={handleRemoveBanner}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cosmic-accent/50 hover:bg-white/5 transition-all"
                >
                  <Upload size={24} className="text-white/40" />
                  <p className="text-white/40 text-sm">Click to upload banner</p>
                  <p className="text-white/25 text-xs">PNG, JPG, GIF, WEBP · Max 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={handleBannerSelect}
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/80 text-sm font-medium">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="bg-white/5 border-white/10 text-white text-sm"
                    placeholder="#7c3aed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 text-sm font-medium">Accent Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="bg-white/5 border-white/10 text-white text-sm"
                    placeholder="#a78bfa"
                  />
                </div>
              </div>
            </div>

            {/* Font */}
            <div className="space-y-2">
              <Label className="text-white/80 text-sm font-medium">Community Font</Label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-cosmic-surface border-cosmic-border">
                  {FONT_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload progress */}
            {updateSettings.isPending && uploadProgress > 0 && uploadProgress < 100 && (
              <div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cosmic-accent transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-white/40 mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateSettings.isPending}
                className="flex-1 bg-cosmic-accent hover:bg-cosmic-accent/80 text-white"
              >
                {updateSettings.isPending ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="mt-4">
            <MemberPermissionsPanel communityId={communityId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
