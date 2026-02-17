import { useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQuickChatProfile } from '../hooks/useQuickChatProfile';
import { useSessionData } from '../hooks/useSessionData';
import { useListPlayerDocuments } from '../hooks/usePlayerDocuments';
import { useGetSessionDocument } from '../hooks/useSessionDocuments';
import type { SessionContext } from '../App';
import type { Channel, MembersChannel, PlayerDocument } from '../backend';
import SessionSidebar from '../components/session/SessionSidebar';
import ChannelChatView from '../components/chat/ChannelChatView';
import PlayerDocumentEditorView from '../components/docs/PlayerDocumentEditorView';
import DocumentEditorView from '../components/docs/DocumentEditorView';
import PlayerDocumentsDialog from '../components/session/PlayerDocumentsDialog';
import SessionDocumentsDialog from '../components/session/SessionDocumentsDialog';
import { Button } from '../components/ui/button';
import { LogOut, ArrowLeft, Users, FileText, FolderOpen } from 'lucide-react';
import { Separator } from '../components/ui/separator';

type SessionPageProps = {
  sessionContext: SessionContext;
  onLeaveSession: () => void;
  onLogout: () => void;
};

type ViewType = 'channel' | 'playerDocument' | 'sessionDocument';

export default function SessionPage({ sessionContext, onLeaveSession, onLogout }: SessionPageProps) {
  const { actor } = useActor();
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
    isLoading,
    refetchSession,
    refetchChannels,
    refetchMembersChannels,
    refetchMessages,
  } = useSessionData(sessionContext.sessionId, selectedChannelId);

  const { data: playerDocuments, refetch: refetchPlayerDocuments } = useListPlayerDocuments(sessionContext.sessionId);
  const { data: currentSessionDocument, refetch: refetchCurrentSessionDocument } = useGetSessionDocument(selectedSessionDocumentId);

  // Derive effective nickname: use quick profile display name if set, otherwise session nickname
  const effectiveNickname = quickProfile?.displayName || sessionContext.nickname;

  // Auto-select first channel on load
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

  const isHost = identity?.getPrincipal().toString() === session?.host.toString();

  return (
    <div className="session-page-container">
      {/* Header */}
      <header className="border-b border-border bg-card px-2 py-1.5 sm:px-4 sm:py-2 flex-shrink-0 w-full overflow-hidden">
        <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
          {/* Top row: Leave button + Session info */}
          <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
            <Button variant="ghost" size="sm" onClick={onLeaveSession} className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm flex-shrink-0">
              <ArrowLeft className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1 overflow-hidden">
              <h1 className="text-sm sm:text-base font-semibold truncate leading-tight">{session?.name || 'Loading...'}</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate leading-tight">
                ID: {sessionContext.sessionId.toString()}
                {isHost && ' • Host'}
              </p>
            </div>
          </div>

          {/* Bottom row: Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full">
            <Button variant="outline" size="sm" onClick={() => setShowSessionDocuments(true)} className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm flex-shrink-0">
              <FolderOpen className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Documents</span>
              <span className="sm:hidden">Docs</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowPlayerDocuments(true)} className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm flex-shrink-0">
              <FileText className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Player Documents</span>
              <span className="sm:hidden">Player</span>
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-5 flex-shrink-0" />
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{session?.members.length || 0}</span>
            </div>
            <Separator orientation="vertical" className="h-4 sm:h-5 flex-shrink-0" />
            <Button variant="ghost" size="sm" onClick={onLogout} className="h-7 w-7 p-0 sm:h-8 sm:w-8 flex-shrink-0">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="session-content-area">
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
          {viewType === 'sessionDocument' && selectedSessionDocumentId && currentSessionDocument && (
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

      {/* Session Documents Dialog */}
      <SessionDocumentsDialog
        sessionId={sessionContext.sessionId}
        open={showSessionDocuments}
        onOpenChange={setShowSessionDocuments}
        onSelectDocument={handleSelectSessionDocument}
      />
    </div>
  );
}
