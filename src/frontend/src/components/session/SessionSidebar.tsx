import { useState } from 'react';
import type { Channel, Document } from '../../backend';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Hash, FileText, Plus, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import ChannelManagementDialogs from './ChannelManagementDialogs';
import DocumentManagementDialogs from './DocumentManagementDialogs';

type SessionSidebarProps = {
  sessionId: bigint;
  channels: Channel[];
  documents: Document[];
  selectedChannelId: bigint | null;
  selectedDocumentId: bigint | null;
  isHost: boolean;
  onSelectChannel: (channel: Channel) => void;
  onSelectDocument: (doc: Document) => void;
  onChannelsChanged: () => void;
  onDocumentsChanged: () => void;
};

export default function SessionSidebar({
  sessionId,
  channels,
  documents,
  selectedChannelId,
  selectedDocumentId,
  isHost,
  onSelectChannel,
  onSelectDocument,
  onChannelsChanged,
  onDocumentsChanged,
}: SessionSidebarProps) {
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateDocument, setShowCreateDocument] = useState(false);

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
        <div className="p-3 flex-1 flex flex-col overflow-hidden">
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
          <ScrollArea className="flex-1">
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
    </>
  );
}
