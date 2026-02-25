import { useState } from 'react';
import type { Channel, MembersChannel } from '../../types/session';
import ChannelManagementDialogs from './ChannelManagementDialogs';
import MembersChannelManagementDialogs from './MembersChannelManagementDialogs';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Hash, Plus, MoreHorizontal, Users } from 'lucide-react';

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
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateMembersChannel, setShowCreateMembersChannel] = useState(false);

  return (
    <aside className="w-56 border-r border-border bg-card hidden md:flex flex-col shrink-0">
      <ScrollArea className="flex-1">
        {/* Host Channels */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Channels
            </span>
            {isHost && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setShowCreateChannel(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="space-y-0.5">
            {channels.map((channel) => (
              <div key={channel.id.toString()} className="flex items-center group">
                <button
                  onClick={() => onSelectChannel(channel)}
                  className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors min-h-[44px] ${
                    selectedChannelId === channel.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="truncate">{channel.name}</span>
                </button>
                {isHost && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
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
        </div>

        <Separator />

        {/* Members Channels */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Members
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setShowCreateMembersChannel(true)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-0.5">
            {membersChannels.map((channel) => (
              <div key={channel.id.toString()} className="flex items-center group">
                <button
                  onClick={() => onSelectMembersChannel(channel)}
                  className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors min-h-[44px] ${
                    selectedChannelId === channel.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="truncate">{channel.name}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <MembersChannelManagementDialogs
                      sessionId={sessionId}
                      channel={channel}
                      onSuccess={onMembersChannelsChanged}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Create Channel Dialogs */}
      <ChannelManagementDialogs
        sessionId={sessionId}
        isCreateDialog
        open={showCreateChannel}
        onOpenChange={setShowCreateChannel}
        onSuccess={() => {
          onChannelsChanged();
          setShowCreateChannel(false);
        }}
      />

      <MembersChannelManagementDialogs
        sessionId={sessionId}
        isCreateDialog
        open={showCreateMembersChannel}
        onOpenChange={setShowCreateMembersChannel}
        onSuccess={() => {
          onMembersChannelsChanged();
          setShowCreateMembersChannel(false);
        }}
      />
    </aside>
  );
}
