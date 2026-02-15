import { useState, useRef } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useRemoveProfilePicture } from '../../hooks/useUserProfile';
import { ExternalBlob } from '../../backend';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Upload, X } from 'lucide-react';
import Avatar from './Avatar';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProfilePictureSection() {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const removeProfilePicture = useRemoveProfilePicture();
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadProgress(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image file is too large. Maximum size is 5MB.');
      return;
    }

    try {
      // Read file as bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with upload progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Save profile with new picture
      await saveProfile.mutateAsync({
        name: profile?.name || '',
        profilePicture: blob,
      });

      setUploadProgress(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload profile picture');
      setUploadProgress(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove your profile picture?')) return;

    setError('');
    try {
      await removeProfilePicture.mutateAsync();
    } catch (err: any) {
      console.error('Remove error:', err);
      setError(err.message || 'Failed to remove profile picture');
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentImageUrl = profile?.profilePicture?.getDirectURL();
  const isUploading = uploadProgress !== null;
  const isRemoving = removeProfilePicture.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-3">
          <Avatar
            imageUrl={currentImageUrl}
            name={profile?.name || 'User'}
            size="lg"
          />
          {isUploading && (
            <div className="text-xs text-muted-foreground">
              Uploading: {Math.round(uploadProgress)}%
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <Label className="text-base">Profile Picture</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a profile picture to personalize your account
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isUploading || isRemoving}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {currentImageUrl ? 'Change Picture' : 'Upload Picture'}
                </>
              )}
            </Button>

            {currentImageUrl && (
              <Button
                variant="outline"
                disabled={isUploading || isRemoving}
                onClick={handleRemove}
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </>
                )}
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <p className="text-xs text-muted-foreground">
            Supported formats: JPEG, PNG, GIF. Maximum size: 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}
