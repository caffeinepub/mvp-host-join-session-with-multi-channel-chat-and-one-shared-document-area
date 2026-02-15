import { useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSessionData } from '../hooks/useSessionData';
import type { SessionContext } from '../App';
import type { Channel, Document, SessionMember } from '../backend';
import SessionSidebar from '../components/session/SessionSidebar';
import ChannelChatView from '../components/chat/ChannelChatView';
import DocumentEditorView from '../components/docs/DocumentEditorView';
import { Button } from '../components/ui/button';
import { LogOut, ArrowLeft, Users } from 'lucide-react';
import { Separator } from '../components/ui/separator';

type SessionPageProps = {
  sessionContext: SessionContext;
  onLeaveSession: () => void;
  onLogout: () => void;
};

type ViewType = 'channel' | 'document';

export default function SessionPage({ sessionContext, onLeaveSession, onLogout }: SessionPageProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [viewType, setViewType] = useState<ViewType>('channel');
  const [selectedChannelId, setSelectedChannelId] = useState<bigint | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<bigint | null>(null);

  const {
    session,
    channels,
    documents,
    messages,
    currentDocument,
    isLoading,
    refetchSession,
    refetchChannels,
    refetchDocuments,
    refetchMessages,
    refetchDocument,
  } = useSessionData(sessionContext.sessionId, selectedChannelId, selectedDocumentId);

  // Auto-select first channel on load
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
      setViewType('channel');
    }
  }, [channels, selectedChannelId]);

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannelId(channel.id);
    setViewType('channel');
  };

  const handleSelectDocument = (doc: Document) => {
    setSelectedDocumentId(doc.id);
    setViewType('document');
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
          documents={documents || []}
          selectedChannelId={selectedChannelId}
          selectedDocumentId={selectedDocumentId}
          isHost={isHost}
          onSelectChannel={handleSelectChannel}
          onSelectDocument={handleSelectDocument}
          onChannelsChanged={refetchChannels}
          onDocumentsChanged={refetchDocuments}
        />

        {/* Main Panel */}
        <main className="flex-1 overflow-hidden">
          {viewType === 'channel' && selectedChannelId && (
            <ChannelChatView
              sessionId={sessionContext.sessionId}
              channelId={selectedChannelId}
              channelName={channels?.find((c) => c.id === selectedChannelId)?.name || ''}
              nickname={sessionContext.nickname}
              messages={messages || []}
              members={session?.members || []}
              onMessagesChanged={refetchMessages}
            />
          )}
          {viewType === 'document' && selectedDocumentId && currentDocument && (
            <DocumentEditorView
              document={currentDocument}
              isHost={isHost}
              onDocumentChanged={refetchDocument}
            />
          )}
          {!selectedChannelId && !selectedDocumentId && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>Select a channel or document to get started</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
