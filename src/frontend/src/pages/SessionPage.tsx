import { useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSessionData } from '../hooks/useSessionData';
import { useListPlayerDocuments } from '../hooks/usePlayerDocuments';
import type { SessionContext } from '../App';
import type { Channel, MembersChannel, PlayerDocument } from '../backend';
import SessionSidebar from '../components/session/SessionSidebar';
import ChannelChatView from '../components/chat/ChannelChatView';
import PlayerDocumentEditorView from '../components/docs/PlayerDocumentEditorView';
import PlayerDocumentsDialog from '../components/session/PlayerDocumentsDialog';
import { Button } from '../components/ui/button';
import { LogOut, ArrowLeft, Users, FileText } from 'lucide-react';
import { Separator } from '../components/ui/separator';

type SessionPageProps = {
  sessionContext: SessionContext;
  onLeaveSession: () => void;
  onLogout: () => void;
};

type ViewType = 'channel' | 'playerDocument';

export default function SessionPage({ sessionContext, onLeaveSession, onLogout }: SessionPageProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [viewType, setViewType] = useState<ViewType>('channel');
  const [selectedChannelId, setSelectedChannelId] = useState<bigint | null>(null);
  const [selectedPlayerDocumentId, setSelectedPlayerDocumentId] = useState<bigint | null>(null);
  const [showPlayerDocuments, setShowPlayerDocuments] = useState(false);

  const {
    session,
    channels,
    membersChannels,
    messages,
    isLoading,
    refetchSession,
    refetchChannels,
    refetchMembersChannels,
    refetchMessages,
  } = useSessionData(sessionContext.sessionId, selectedChannelId);

  const { data: playerDocuments, refetch: refetchPlayerDocuments } = useListPlayerDocuments(sessionContext.sessionId);

  // Auto-select first channel on load
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
      setViewType('channel');
    }
  }, [channels, selectedChannelId]);

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannelId(channel.id);
    setSelectedPlayerDocumentId(null);
    setViewType('channel');
  };

  const handleSelectMembersChannel = (channel: MembersChannel) => {
    setSelectedChannelId(channel.id);
    setSelectedPlayerDocumentId(null);
    setViewType('channel');
  };

  const handleSelectPlayerDocument = (doc: PlayerDocument) => {
    setSelectedPlayerDocumentId(doc.id);
    setSelectedChannelId(null);
    setViewType('playerDocument');
    setShowPlayerDocuments(false);
  };

  const handlePlayerDocumentCreated = (documentId: bigint) => {
    setSelectedPlayerDocumentId(documentId);
    setSelectedChannelId(null);
    setViewType('playerDocument');
  };

  const isHost = identity?.getPrincipal().toString() === session?.host.toString();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onLeaveSession}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Leave
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-lg font-semibold">{session?.name || 'Loading...'}</h1>
            <p className="text-xs text-muted-foreground">
              Session ID: {sessionContext.sessionId.toString()}
              {isHost && ' • You are the host'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPlayerDocuments(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Player Documents
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{session?.members.length || 0} members</span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <SessionSidebar
          sessionId={sessionContext.sessionId}
          channels={channels || []}
          membersChannels={membersChannels || []}
          selectedChannelId={selectedChannelId}
          isHost={isHost}
          onSelectChannel={handleSelectChannel}
          onSelectMembersChannel={handleSelectMembersChannel}
          onChannelsChanged={refetchChannels}
          onMembersChannelsChanged={refetchMembersChannels}
        />

        {/* Main Panel */}
        <main className="flex-1 overflow-hidden">
          {viewType === 'channel' && selectedChannelId && (
            <ChannelChatView
              sessionId={sessionContext.sessionId}
              channelId={selectedChannelId}
              channelName={
                channels?.find((c) => c.id === selectedChannelId)?.name ||
                membersChannels?.find((c) => c.id === selectedChannelId)?.name ||
                ''
              }
              nickname={sessionContext.nickname}
              messages={messages || []}
              members={session?.members || []}
              onMessagesChanged={refetchMessages}
            />
          )}
          {viewType === 'playerDocument' && selectedPlayerDocumentId && (
            <PlayerDocumentEditorView
              documentId={selectedPlayerDocumentId}
              onDocumentChanged={refetchPlayerDocuments}
            />
          )}
          {!selectedChannelId && !selectedPlayerDocumentId && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>Select a channel to get started</p>
            </div>
          )}
        </main>
      </div>

      {/* Player Documents Dialog */}
      <PlayerDocumentsDialog
        sessionId={sessionContext.sessionId}
        open={showPlayerDocuments}
        onOpenChange={setShowPlayerDocuments}
        onSelectDocument={handleSelectPlayerDocument}
        onDocumentCreated={handlePlayerDocumentCreated}
      />
    </div>
  );
}
