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

type PreLobbySettingsViewProps = {
  onBack: () => void;
};

export default function PreLobbySettingsView({ onBack }: PreLobbySettingsViewProps) {
  const { preferences, updatePreferences, reset } = usePreferences();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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

  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    try {
      const sessionExport = await parseImportFile(file);
      
      if (!validateTemplate(sessionExport)) {
        throw new Error('Invalid template format');
      }

      saveTemplate(sessionExport);
      setSuccess('Template loaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
    }

    // Reset input
    e.target.value = '';
  };

  const handleClearTemplate = () => {
    clearTemplate();
    setSuccess('Template cleared');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleResetAll = () => {
    if (confirm('Reset all settings to default? This will not delete session data.')) {
      reset();
      clearTemplate();
      setSuccess('Settings reset to default');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lobby
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
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
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile picture and information</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePictureSection />
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme-toggle" className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="theme-toggle"
                    checked={preferences.themeMode === 'dark'}
                    onCheckedChange={handleThemeToggle}
                  />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="background-upload" className="text-base">Background Image</Label>
                <p className="text-sm text-muted-foreground">
                  Set a custom background image for the app
                </p>
                
                {preferences.backgroundImage && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                    <img
                      src={preferences.backgroundImage}
                      alt="Background preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleClearBackground}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="relative" asChild>
                    <label htmlFor="background-upload" className="cursor-pointer">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {preferences.backgroundImage ? 'Change Image' : 'Upload Image'}
                      <input
                        id="background-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBackgroundChange}
                      />
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Session Defaults</CardTitle>
              <CardDescription>Set your default nickname for sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="default-nickname">Default Nickname</Label>
                <Input
                  id="default-nickname"
                  type="text"
                  value={preferences.defaultNickname}
                  onChange={(e) => handleNicknameChange(e.target.value)}
                  placeholder="Enter default nickname"
                />
                <p className="text-xs text-muted-foreground">
                  This nickname will be pre-filled when hosting or joining sessions
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Template/History */}
          <Card>
            <CardHeader>
              <CardTitle>Session Template</CardTitle>
              <CardDescription>Load a session template or history file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentTemplate && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Template loaded: <strong>{currentTemplate.session.name}</strong>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={handleClearTemplate}
                    >
                      Clear
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="relative" asChild>
                  <label htmlFor="template-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Load Template
                    <input
                      id="template-upload"
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleTemplateUpload}
                    />
                  </label>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Upload a session export file to use as a template when hosting new sessions
              </p>
            </CardContent>
          </Card>

          {/* Reset */}
          <Card>
            <CardHeader>
              <CardTitle>Reset Settings</CardTitle>
              <CardDescription>Reset all settings to their default values</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleResetAll}>
                Reset All Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
