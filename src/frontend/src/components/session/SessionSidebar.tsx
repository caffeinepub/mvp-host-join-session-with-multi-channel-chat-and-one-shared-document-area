import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { Channel, MembersChannel } from '../../backend';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Hash, Plus, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import ChannelManagementDialogs from './ChannelManagementDialogs';
import MembersChannelManagementDialogs from './MembersChannelManagementDialogs';

type SessionSidebarProps = {
  sessionId: bigint;
  channels: Channel[];
  membersChannels: MembersChannel[];
  selectedChannelId: bigint | null;
  isHost: boolean;
  onSelectChannel: (channel: Channel) => void;
  onSelectMembersChannel: (channel: MembersChannel) => void;
  onChannelsChanged: () => void;
  onMembersChannelsChanged: () => void;
};

export default function SessionSidebar({
  sessionId,
  channels,
  membersChannels,
  selectedChannelId,
  isHost,
  onSelectChannel,
  onSelectMembersChannel,
  onChannelsChanged,
  onMembersChannelsChanged,
}: SessionSidebarProps) {
  const { identity } = useInternetIdentity();
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateMembersChannel, setShowCreateMembersChannel] = useState(false);

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Channels Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Channels</h3>
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
            <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id.toString()}
                  onClick={() => onSelectChannel(channel)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                    selectedChannelId === channel.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <Hash className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{channel.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Members' Channels Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Members' Channels</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowCreateMembersChannel(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {membersChannels.map((channel) => {
                const isCreator = identity && channel.createdBy.toString() === identity.getPrincipal().toString();
                const canManage = isCreator || isHost;
                return (
                  <div
                    key={channel.id.toString()}
                    className={`flex items-center gap-2 rounded ${
                      selectedChannelId === channel.id ? 'bg-accent' : ''
                    }`}
                  >
                    <button
                      onClick={() => onSelectMembersChannel(channel)}
                      className={`flex-1 flex items-center gap-2 px-2 py-1.5 text-sm transition-colors ${
                        selectedChannelId === channel.id
                          ? 'text-accent-foreground'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <Hash className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{channel.name}</span>
                    </button>
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 mr-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <MembersChannelManagementDialogs
                            sessionId={sessionId}
                            channel={channel}
                            onSuccess={onMembersChannelsChanged}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Create Channel Dialog */}
      {isHost && (
        <ChannelManagementDialogs
          sessionId={sessionId}
          isCreateDialog
          open={showCreateChannel}
          onOpenChange={setShowCreateChannel}
          onSuccess={onChannelsChanged}
        />
      )}

      {/* Create Members' Channel Dialog */}
      <MembersChannelManagementDialogs
        sessionId={sessionId}
        isCreateDialog
        open={showCreateMembersChannel}
        onOpenChange={setShowCreateMembersChannel}
        onSuccess={onMembersChannelsChanged}
      />
    </aside>
  );
}
