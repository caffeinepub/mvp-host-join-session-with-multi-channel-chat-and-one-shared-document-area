import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { useGetCallerUserProfile } from './hooks/useUserProfile';
import LobbyPage from './pages/LobbyPage';
import SessionPage from './pages/SessionPage';
import { getSessionStorage, setSessionStorage, clearSessionStorage } from './lib/sessionStorage';
import { usePreferences } from './hooks/usePreferences';
import { PreferencesProvider } from './context/PreferencesContext';
import { AppErrorBoundary } from './components/app/AppErrorBoundary';
import { clearLocalAppData } from './lib/clearLocalAppData';
import { Button } from './components/ui/button';
import { Alert, AlertDescription } from './components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export type SessionContext = {
  sessionId: bigint;
  nickname: string;
  isHost: boolean;
};

function AppInner() {
  const { identity, login, clear, loginStatus, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { preferences } = usePreferences();
  const queryClient = useQueryClient();
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const isAuthenticated = !!identity;

  // Use the user profile hook with proper loading state
  const { data: userProfile, isLoading: profileQueryLoading, isFetched } = useGetCallerUserProfile();
  
  // Determine if we should show profile setup
  const showProfileSetup = isAuthenticated && !actorFetching && !profileQueryLoading && isFetched && userProfile === null;

  // Try to restore session from storage when profile is ready
  useEffect(() => {
    if (userProfile && !sessionContext) {
      const stored = getSessionStorage();
      if (stored) {
        setSessionContext(stored);
      }
    }
  }, [userProfile, sessionContext]);

  const handleProfileSetup = async () => {
    if (!actor || !profileName.trim()) return;

    setProfileLoading(true);
    try {
      await actor.saveCallerUserProfile({ name: profileName.trim() });
      
      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      
      // Try to restore session from storage
      const stored = getSessionStorage();
      if (stored) {
        setSessionContext(stored);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSessionJoined = (context: SessionContext) => {
    setSessionContext(context);
    setSessionStorage(context);
  };

  const handleLeaveSession = () => {
    setSessionContext(null);
    clearSessionStorage();
  };

  const handleLogout = async () => {
    await clear();
    setSessionContext(null);
    clearSessionStorage();
    setProfileName('');
    // Clear all cached data on logout
    queryClient.clear();
  };

  // Calculate scale factor
  const scaleFactor = preferences.uiScalePercent / 100;

  // Loading state - only show while truly initializing
  if (isInitializing || (isAuthenticated && actorFetching)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {preferences.backgroundImage && (
          <>
            <div 
              className="fixed inset-0 z-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${preferences.backgroundImage})`,
                filter: 'blur(8px)',
              }}
            />
            <div className="fixed inset-0 z-0 bg-background/80" />
          </>
        )}
        <div className="flex flex-col items-center gap-4 relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Profile setup screen
  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {preferences.backgroundImage && (
          <>
            <div 
              className="fixed inset-0 z-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${preferences.backgroundImage})`,
                filter: 'blur(8px)',
              }}
            />
            <div className="fixed inset-0 z-0 bg-background/80" />
          </>
        )}
        <div className="w-full max-w-md space-y-6 relative z-10">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Welcome!</h1>
            <p className="text-muted-foreground">Please tell us your name to get started.</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="profile-name" className="text-sm font-medium">
                Your Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleProfileSetup()}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                disabled={profileLoading}
                autoFocus
              />
            </div>
            
            <Button
              onClick={handleProfileSetup}
              disabled={!profileName.trim() || profileLoading}
              className="w-full"
            >
              {profileLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {preferences.backgroundImage && (
          <>
            <div 
              className="fixed inset-0 z-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${preferences.backgroundImage})`,
                filter: 'blur(8px)',
              }}
            />
            <div className="fixed inset-0 z-0 bg-background/80" />
          </>
        )}
        <div className="w-full max-w-md space-y-6 relative z-10">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">RPG Collaboration</h1>
            <p className="text-muted-foreground">
              A lightweight multiplayer chat and RPG tool for your gaming sessions.
            </p>
          </div>
          
          <Alert>
            <AlertDescription>
              Please log in to host or join a session.
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={login}
            disabled={loginStatus === 'logging-in'}
            className="w-full"
            size="lg"
          >
            {loginStatus === 'logging-in' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated and profile exists
  return (
    <div 
      className="app-scale-root"
      style={{
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'top left',
        width: `${100 / scaleFactor}%`,
        height: `${100 / scaleFactor}%`,
      }}
    >
      {sessionContext ? (
        <SessionPage
          sessionContext={sessionContext}
          onLeaveSession={handleLeaveSession}
          onLogout={handleLogout}
        />
      ) : (
        <LobbyPage
          onSessionJoined={handleSessionJoined}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary onClearData={clearLocalAppData}>
      <PreferencesProvider>
        <AppInner />
      </PreferencesProvider>
    </AppErrorBoundary>
  );
}
