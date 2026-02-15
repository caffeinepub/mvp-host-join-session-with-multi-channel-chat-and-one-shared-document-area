import { useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { usePreferences } from '../hooks/usePreferences';
import { loadTemplate } from '../lib/templateHistoryStorage';
import type { SessionContext } from '../App';
import PreLobbySettingsView from '../components/settings/PreLobbySettingsView';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, LogOut, Settings } from 'lucide-react';

type LobbyPageProps = {
  onSessionJoined: (context: SessionContext) => void;
  onLogout: () => void;
};

export default function LobbyPage({ onSessionJoined, onLogout }: LobbyPageProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { preferences } = usePreferences();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'host' | 'join'>('host');
  
  // Host form state
  const [hostSessionName, setHostSessionName] = useState('');
  const [hostPassword, setHostPassword] = useState('');
  const [hostNickname, setHostNickname] = useState('');
  const [hostLoading, setHostLoading] = useState(false);
  const [hostError, setHostError] = useState('');

  // Join form state
  const [joinSessionId, setJoinSessionId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinNickname, setJoinNickname] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Pre-fill nicknames from preferences
  useEffect(() => {
    if (preferences.defaultNickname) {
      if (!hostNickname) setHostNickname(preferences.defaultNickname);
      if (!joinNickname) setJoinNickname(preferences.defaultNickname);
    }
  }, [preferences.defaultNickname]);

  const handleHostSession = async () => {
    if (!actor || !hostSessionName.trim() || !hostNickname.trim()) {
      setHostError('Please fill in all required fields');
      return;
    }

    setHostLoading(true);
    setHostError('');

    try {
      const session = await actor.createSession({
        name: hostSessionName.trim(),
        password: hostPassword.trim() || undefined,
        hostNickname: hostNickname.trim(),
      });

      // Apply template if one is loaded
      const template = loadTemplate();
      if (template) {
        try {
          // Create channels from template
          for (const channel of template.channels) {
            if (channel.name !== 'Main') {
              await actor.createChannel(session.id, channel.name);
            }
          }

          // Create documents from template
          for (const doc of template.documents) {
            await actor.createDocument(session.id, doc.name, doc.content);
          }
        } catch (templateError) {
          console.error('Error applying template:', templateError);
          // Continue anyway - session was created successfully
        }
      }

      onSessionJoined({
        sessionId: session.id,
        nickname: hostNickname.trim(),
        isHost: true,
      });
    } catch (error: any) {
      console.error('Error creating session:', error);
      setHostError(error.message || 'Failed to create session');
    } finally {
      setHostLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!actor || !joinSessionId.trim() || !joinNickname.trim()) {
      setJoinError('Please fill in all required fields');
      return;
    }

    setJoinLoading(true);
    setJoinError('');

    try {
      const sessionId = BigInt(joinSessionId.trim());
      const result = await actor.joinSession({
        sessionId,
        nickname: joinNickname.trim(),
        password: joinPassword.trim() || undefined,
      });

      if (result.__kind__ === 'error') {
        setJoinError(result.error);
        setJoinLoading(false);
        return;
      }

      onSessionJoined({
        sessionId,
        nickname: joinNickname.trim(),
        isHost: false,
      });
    } catch (error: any) {
      console.error('Error joining session:', error);
      setJoinError(error.message || 'Failed to join session');
    } finally {
      setJoinLoading(false);
    }
  };

  if (showSettings) {
    return <PreLobbySettingsView onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">RPG Collaboration</h1>
            <p className="text-sm text-muted-foreground">Host or join a session</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'host' | 'join')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="host">Host Session</TabsTrigger>
              <TabsTrigger value="join">Join Session</TabsTrigger>
            </TabsList>

            {/* Host Tab */}
            <TabsContent value="host">
              <Card>
                <CardHeader>
                  <CardTitle>Create a New Session</CardTitle>
                  <CardDescription>
                    Start a new RPG session and invite others to join.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hostError && (
                    <Alert variant="destructive">
                      <AlertDescription>{hostError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="host-session-name">
                      Session Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="host-session-name"
                      value={hostSessionName}
                      onChange={(e) => setHostSessionName(e.target.value)}
                      placeholder="e.g., Dragon's Lair Campaign"
                      disabled={hostLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="host-nickname">
                      Your Nickname <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="host-nickname"
                      value={hostNickname}
                      onChange={(e) => setHostNickname(e.target.value)}
                      placeholder="e.g., Dungeon Master"
                      disabled={hostLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="host-password">Password (Optional)</Label>
                    <Input
                      id="host-password"
                      type="password"
                      value={hostPassword}
                      onChange={(e) => setHostPassword(e.target.value)}
                      placeholder="Leave empty for no password"
                      disabled={hostLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Set a password to restrict who can join your session.
                    </p>
                  </div>

                  <Button
                    onClick={handleHostSession}
                    disabled={hostLoading || !hostSessionName.trim() || !hostNickname.trim()}
                    className="w-full"
                  >
                    {hostLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Session...
                      </>
                    ) : (
                      'Create Session'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Join Tab */}
            <TabsContent value="join">
              <Card>
                <CardHeader>
                  <CardTitle>Join an Existing Session</CardTitle>
                  <CardDescription>
                    Enter the session ID provided by the host.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {joinError && (
                    <Alert variant="destructive">
                      <AlertDescription>{joinError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="join-session-id">
                      Session ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="join-session-id"
                      value={joinSessionId}
                      onChange={(e) => setJoinSessionId(e.target.value)}
                      placeholder="e.g., 1"
                      disabled={joinLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ask the host for the session ID.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-nickname">
                      Your Nickname <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="join-nickname"
                      value={joinNickname}
                      onChange={(e) => setJoinNickname(e.target.value)}
                      placeholder="e.g., Aragorn"
                      disabled={joinLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-password">Password (if required)</Label>
                    <Input
                      id="join-password"
                      type="password"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      placeholder="Enter password if session is protected"
                      disabled={joinLoading}
                    />
                  </div>

                  <Button
                    onClick={handleJoinSession}
                    disabled={joinLoading || !joinSessionId.trim() || !joinNickname.trim()}
                    className="w-full"
                  >
                    {joinLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining Session...
                      </>
                    ) : (
                      'Join Session'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
            {' '}© {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
