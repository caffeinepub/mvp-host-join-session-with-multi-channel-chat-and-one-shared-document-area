import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { QuickChatProfile } from '../../lib/quickChatProfileStorage';

type QuickChatProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: QuickChatProfile | null;
  onSave: (profile: QuickChatProfile) => void;
  onClear: () => void;
};

export default function QuickChatProfileDialog({
  open,
  onOpenChange,
  currentProfile,
  onSave,
  onClear,
}: QuickChatProfileDialogProps) {
  const [displayName, setDisplayName] = useState('');
  const [avatarDataUrl, setAvatarDataUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with current profile when dialog opens
  useEffect(() => {
    if (open) {
      setDisplayName(currentProfile?.displayName || '');
      setAvatarDataUrl(currentProfile?.avatarDataUrl || '');
    }
  }, [open, currentProfile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    // Convert to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarDataUrl(dataUrl);
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Please enter a display name');
      return;
    }

    if (!avatarDataUrl) {
      toast.error('Please select a profile picture');
      return;
    }

    setIsSaving(true);
    try {
      onSave({
        displayName: displayName.trim(),
        avatarDataUrl,
      });
      toast.success('Quick profile saved');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save quick profile:', error);
      toast.error('Failed to save quick profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    onClear();
    setDisplayName('');
    setAvatarDataUrl('');
    toast.success('Quick profile cleared');
    onOpenChange(false);
  };

  const handleRemoveImage = () => {
    setAvatarDataUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Chat Profile</DialogTitle>
          <DialogDescription>
            Set a quick display name and profile picture for this chat session. This is stored locally on your device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Display Name Input */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Profile Picture Input */}
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Picture</Label>
            <div className="flex items-center gap-4">
              {avatarDataUrl ? (
                <div className="relative">
                  <img
                    src={avatarDataUrl}
                    alt="Profile preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB, JPG/PNG
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          {currentProfile && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleClear}
              disabled={isSaving}
            >
              Clear
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
