import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { Channel, Document, PlayerDocument } from '../../backend';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Hash, FileText, Plus, MoreVertical, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import ChannelManagementDialogs from './ChannelManagementDialogs';
import DocumentManagementDialogs from './DocumentManagementDialogs';
import { CreatePlayerDocumentDialog, PlayerDocumentMenu } from './PlayerDocumentManagementDialogs';

type SessionSidebarProps = {
  sessionId: bigint;
  channels: Channel[];
  documents: Document[];
  playerDocuments: PlayerDocument[];
  selectedChannelId: bigint | null;
  selectedDocumentId: bigint | null;
  selectedPlayerDocumentId: bigint | null;
  isHost: boolean;
  onSelectChannel: (channel: Channel) => void;
  onSelectDocument: (doc: Document) => void;
  onSelectPlayerDocument: (doc: PlayerDocument) => void;
  onChannelsChanged: () => void;
  onDocumentsChanged: () => void;
  onPlayerDocumentsChanged: () => void;
};

export default function SessionSidebar({
  sessionId,
  channels,
  documents,
  playerDocuments,
  selectedChannelId,
  selectedDocumentId,
  selectedPlayerDocumentId,
  isHost,
  onSelectChannel,
  onSelectDocument,
  onSelectPlayerDocument,
  onChannelsChanged,
  onDocumentsChanged,
  onPlayerDocumentsChanged,
}: SessionSidebarProps) {
  const { identity } = useInternetIdentity();
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateDocument, setShowCreateDocument] = useState(false);
  const [showCreatePlayerDocument, setShowCreatePlayerDocument] = useState(false);

  return (
    <>
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
        {/* Channels Section */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase text-sidebar-foreground/70">Channels</h2>
            {isHost && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowCreateChannel(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {channels.map((channel) => (
                <div key={channel.id.toString()} className="flex items-center gap-1">
                  <Button
                    variant={selectedChannelId === channel.id ? 'secondary' : 'ghost'}
                    size="sm"
                    className="flex-1 justify-start text-sm"
                    onClick={() => onSelectChannel(channel)}
                  >
                    <Hash className="mr-2 h-4 w-4" />
                    {channel.name}
                  </Button>
                  {isHost && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ChannelManagementDialogs
                          sessionId={sessionId}
                          channel={channel}
                          onSuccess={onChannelsChanged}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Documents Section */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase text-sidebar-foreground/70">Documents</h2>
            {isHost && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowCreateDocument(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {documents.map((doc) => (
                <div key={doc.id.toString()} className="flex items-center gap-1">
                  <Button
                    variant={selectedDocumentId === doc.id ? 'secondary' : 'ghost'}
                    size="sm"
                    className="flex-1 justify-start text-sm"
                    onClick={() => onSelectDocument(doc)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {doc.name}
                  </Button>
                  {isHost && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DocumentManagementDialogs
                          document={doc}
                          onSuccess={onDocumentsChanged}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Players' Documents Section */}
        <div className="p-3 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase text-sidebar-foreground/70">Players' Documents</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowCreatePlayerDocument(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {playerDocuments.map((doc) => {
                const isOwner = identity && doc.owner.toString() === identity.getPrincipal().toString();
                return (
                  <div key={doc.id.toString()} className="flex items-center gap-1">
                    <Button
                      variant={selectedPlayerDocumentId === doc.id ? 'secondary' : 'ghost'}
                      size="sm"
                      className="flex-1 justify-start text-sm"
                      onClick={() => onSelectPlayerDocument(doc)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {doc.name}
                    </Button>
                    {isOwner && (
                      <PlayerDocumentMenu
                        document={doc}
                        isOwner={isOwner}
                        onSuccess={onPlayerDocumentsChanged}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Create Dialogs */}
      {isHost && (
        <>
          <ChannelManagementDialogs
            sessionId={sessionId}
            isCreateDialog
            open={showCreateChannel}
            onOpenChange={setShowCreateChannel}
            onSuccess={onChannelsChanged}
          />
          <DocumentManagementDialogs
            sessionId={sessionId}
            isCreateDialog
            open={showCreateDocument}
            onOpenChange={setShowCreateDocument}
            onSuccess={onDocumentsChanged}
          />
        </>
      )}
      
      <CreatePlayerDocumentDialog
        sessionId={sessionId}
        open={showCreatePlayerDocument}
        onOpenChange={setShowCreatePlayerDocument}
        onSuccess={onPlayerDocumentsChanged}
      />
    </>
  );
}
