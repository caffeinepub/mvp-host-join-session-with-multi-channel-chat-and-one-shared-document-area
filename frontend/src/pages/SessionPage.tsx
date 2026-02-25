import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQuickChatProfile } from '../hooks/useQuickChatProfile';
import { useSessionData } from '../hooks/useSessionData';
import { useListPlayerDocuments } from '../hooks/usePlayerDocuments';
import { useGetSessionDocument } from '../hooks/useSessionDocuments';
import type { SessionContext } from '../App';
import type { Channel, MembersChannel, PlayerDocument } from '../types/session';
import SessionSidebar from '../components/session/SessionSidebar';
import ChannelChatView from '../components/chat/ChannelChatView';
import PlayerDocumentEditorView from '../components/docs/PlayerDocumentEditorView';
import DocumentEditorView from '../components/docs/DocumentEditorView';
import PlayerDocumentsDialog from '../components/session/PlayerDocumentsDialog';
import SessionDocumentsDialog from '../components/session/SessionDocumentsDialog';
import { Button } from '../components/ui/button';
import { LogOut, ArrowLeft, FileText, FolderOpen, Globe } from 'lucide-react';
import { Separator } from '../components/ui/separator';

type SessionPageProps = {
  sessionContext: SessionContext;
  onLeaveSession: () => void;
  onLogout: () => void;
  onNavigateToCommunities: () => void;
};

type ViewType = 'channel' | 'playerDocument' | 'sessionDocument';

export default function SessionPage({
  sessionContext,
  onLeaveSession,
  onLogout,
  onNavigateToCommunities,
}: SessionPageProps) {
  const { identity } = useInternetIdentity();
  const { profile: quickProfile } = useQuickChatProfile();
  const [viewType, setViewType] = useState<ViewType>('channel');
  const [selectedChannelId, setSelectedChannelId] = useState<bigint | null>(null);
  const [selectedPlayerDocumentId, setSelectedPlayerDocumentId] = useState<bigint | null>(null);
  const [selectedSessionDocumentId, setSelectedSessionDocumentId] = useState<bigint | null>(null);
  const [showPlayerDocuments, setShowPlayerDocuments] = useState(false);
  const [showSessionDocuments, setShowSessionDocuments] = useState(false);

  const {
    session,
    channels,
    membersChannels,
    messages,
    refetchChannels,
    refetchMembersChannels,
    refetchMessages,
  } = useSessionData(sessionContext.sessionId, selectedChannelId);

  const { data: playerDocuments, refetch: refetchPlayerDocuments } = useListPlayerDocuments(
    sessionContext.sessionId
  );
  const { data: currentSessionDocument, refetch: refetchCurrentSessionDocument } =
    useGetSessionDocument(selectedSessionDocumentId);

  const effectiveNickname = quickProfile?.displayName || sessionContext.nickname;

  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId && viewType === 'channel') {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId, viewType]);

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannelId(channel.id);
    setSelectedPlayerDocumentId(null);
    setSelectedSessionDocumentId(null);
    setViewType('channel');
  };

  const handleSelectMembersChannel = (channel: MembersChannel) => {
    setSelectedChannelId(channel.id);
    setSelectedPlayerDocumentId(null);
    setSelectedSessionDocumentId(null);
    setViewType('channel');
  };

  const handleSelectPlayerDocument = (doc: PlayerDocument) => {
    setSelectedPlayerDocumentId(doc.id);
    setSelectedChannelId(null);
    setSelectedSessionDocumentId(null);
    setViewType('playerDocument');
    setShowPlayerDocuments(false);
  };

  const handleSelectSessionDocument = (documentId: bigint) => {
    setSelectedSessionDocumentId(documentId);
    setSelectedChannelId(null);
    setSelectedPlayerDocumentId(null);
    setViewType('sessionDocument');
    setShowSessionDocuments(false);
  };

  const handlePlayerDocumentCreated = (documentId: bigint) => {
    setSelectedPlayerDocumentId(documentId);
    setSelectedChannelId(null);
    setSelectedSessionDocumentId(null);
    setViewType('playerDocument');
  };

  const isHost =
    identity?.getPrincipal().toString() === session?.host?.toString() ||
    sessionContext.isHost;

  return (
    <div className="session-page-container">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onLeaveSession}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Leave
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-lg font-semibold">
              {session?.name || `Session ${sessionContext.sessionId.toString()}`}
            </h1>
            <p className="text-xs text-muted-foreground">
              {sessionContext.isHost ? 'You are the host' : `Joined as ${effectiveNickname}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSessionDocuments(true)}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Documents
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPlayerDocuments(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Player Docs
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="session-content-area">
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

        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="border-b border-border bg-card px-4 py-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onNavigateToCommunities}>
              <Globe className="mr-2 h-4 w-4" />
              Communities
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            {viewType === 'channel' && selectedChannelId && (
              <ChannelChatView
                sessionId={sessionContext.sessionId}
                channelId={selectedChannelId}
                channelName={
                  channels?.find((c) => c.id === selectedChannelId)?.name ||
                  membersChannels?.find((c) => c.id === selectedChannelId)?.name ||
                  ''
                }
                nickname={effectiveNickname}
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
            {viewType === 'sessionDocument' &&
              selectedSessionDocumentId &&
              currentSessionDocument && (
                <DocumentEditorView
                  document={currentSessionDocument}
                  isHost={isHost}
                  sessionId={sessionContext.sessionId}
                  onDocumentChanged={refetchCurrentSessionDocument}
                />
              )}
            {!selectedChannelId && !selectedPlayerDocumentId && !selectedSessionDocumentId && (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a channel or document to get started</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <PlayerDocumentsDialog
        sessionId={sessionContext.sessionId}
        open={showPlayerDocuments}
        onOpenChange={setShowPlayerDocuments}
        onSelectDocument={handleSelectPlayerDocument}
        onDocumentCreated={handlePlayerDocumentCreated}
      />

      <SessionDocumentsDialog
        sessionId={sessionContext.sessionId}
        open={showSessionDocuments}
        onOpenChange={setShowSessionDocuments}
        onSelectDocument={handleSelectSessionDocument}
      />
    </div>
  );
}
