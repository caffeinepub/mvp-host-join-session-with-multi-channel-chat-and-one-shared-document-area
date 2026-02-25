import { useState } from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { loadTemplate, saveTemplate, clearTemplate, validateTemplate } from '../../lib/templateHistoryStorage';
import { parseImportFile } from '../../lib/sessionExportFile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Moon, Sun, Image as ImageIcon, Upload, X, FileText } from 'lucide-react';
import { Separator } from '../ui/separator';
import ProfilePictureSection from '../profile/ProfilePictureSection';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useRemoveProfilePicture } from '../../hooks/useUserProfile';
import { ExternalBlob } from '../../backend';

type PreLobbySettingsViewProps = {
  onBack: () => void;
};

export default function PreLobbySettingsView({ onBack }: PreLobbySettingsViewProps) {
  const { preferences, updatePreferences, reset } = usePreferences();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  
  const { data: userProfile } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();
  const removeProfilePictureMutation = useRemoveProfilePicture();
  
  const currentTemplate = loadTemplate();

  const handleThemeToggle = (checked: boolean) => {
    updatePreferences({ themeMode: checked ? 'dark' : 'light' });
  };

  const handleBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updatePreferences({ backgroundImage: dataUrl });
        setSuccess('Background image updated');
        setTimeout(() => setSuccess(''), 3000);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to load image');
    }
  };

  const handleClearBackground = () => {
    updatePreferences({ backgroundImage: null });
    setSuccess('Background image cleared');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleNicknameChange = (value: string) => {
    updatePreferences({ defaultNickname: value });
  };

  const handleProfileImageChange = (file: File | null, previewUrl: string | null) => {
    setProfileImageFile(file);
    setProfileImagePreview(previewUrl);
  };

  const handleRemoveProfilePicture = async () => {
    try {
      await removeProfilePictureMutation.mutateAsync();
      setProfileImageFile(null);
      setProfileImagePreview(null);
      setSuccess('Profile picture removed');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to remove profile picture');
    }
  };

  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    try {
      const sessionExport = await parseImportFile(file);
      
      if (!validateTemplate(sessionExport)) {
        setError('Invalid template file format');
        return;
      }

      saveTemplate(sessionExport);
      setSuccess('Template loaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
    }
  };

  const handleClearTemplate = () => {
    clearTemplate();
    setSuccess('Template cleared');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all settings? This will clear your preferences, template, and background image.')) {
      reset();
      clearTemplate();
      setSuccess('All settings reset');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a profile picture for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePictureSection
              currentImageUrl={userProfile?.profilePicture?.getDirectURL()}
              currentName={userProfile?.name || 'User'}
              onImageChange={handleProfileImageChange}
              onRemove={handleRemoveProfilePicture}
              isUploading={saveProfileMutation.isPending || removeProfilePictureMutation.isPending}
            />
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Choose your preferred color scheme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preferences.themeMode === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <Label htmlFor="theme-toggle">
                  {preferences.themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Label>
              </div>
              <Switch
                id="theme-toggle"
                checked={preferences.themeMode === 'dark'}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Background Image */}
        <Card>
          <CardHeader>
            <CardTitle>Background Image</CardTitle>
            <CardDescription>Customize your lobby background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferences.backgroundImage ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <img
                  src={preferences.backgroundImage}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleClearBackground}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundChange}
                  className="hidden"
                />
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload Background Image
                  </span>
                </Button>
              </label>
            )}
          </CardContent>
        </Card>

        {/* Default Nickname */}
        <Card>
          <CardHeader>
            <CardTitle>Default Nickname</CardTitle>
            <CardDescription>Pre-fill your nickname when joining sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter your default nickname"
              value={preferences.defaultNickname || ''}
              onChange={(e) => handleNicknameChange(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Template Management */}
        <Card>
          <CardHeader>
            <CardTitle>Session Template</CardTitle>
            <CardDescription>Load a pre-configured session template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentTemplate ? (
              <div className="space-y-2">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Template loaded: {currentTemplate.session.name}
                  </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={handleClearTemplate} className="w-full">
                  Clear Template
                </Button>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleTemplateUpload}
                  className="hidden"
                />
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Load Template File
                  </span>
                </Button>
              </label>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Reset All */}
        <Card>
          <CardHeader>
            <CardTitle>Reset Settings</CardTitle>
            <CardDescription>Clear all preferences and return to defaults</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleResetAll} className="w-full">
              Reset All Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
