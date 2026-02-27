import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQuickChatProfile } from '../../hooks/useQuickChatProfile';
import type { Channel, MembersChannel } from '../../types/session';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Hash, Plus, MoreVertical, ChevronLeft, ChevronRight, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import ChannelManagementDialogs from './ChannelManagementDialogs';
import MembersChannelManagementDialogs from './MembersChannelManagementDialogs';
import UIScaleSettingsPopover from '../settings/UIScaleSettingsPopover';
import QuickChatProfileDialog from '../profile/QuickChatProfileDialog';

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
  const { profile: quickProfile, save: saveProfile, clear: clearProfile } = useQuickChatProfile();
  const [collapsed, setCollapsed] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateMembersChannel, setShowCreateMembersChannel] = useState(false);
  const [showQuickChatProfile, setShowQuickChatProfile] = useState(false);

  const displayName = quickProfile?.displayName || identity?.getPrincipal().toString().slice(0, 8) || 'User';

  if (collapsed) {
    return (
      <div className="w-12 border-r border-border bg-card flex flex-col items-center py-4 gap-4 flex-shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(false)}
                className="min-h-[44px] min-w-[44px]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="w-56 border-r border-border bg-card flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold truncate">Channels</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(true)}
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {/* Host Channels */}
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Channels
            </span>
            {isHost && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCreateChannel(true)}
                className="h-5 w-5 min-h-[44px] min-w-[44px]"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>

          {channels.map((channel) => (
            <div key={channel.id.toString()} className="flex items-center group">
              <button
                onClick={() => onSelectChannel(channel)}
                className={`flex-1 flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors min-h-[44px] ${
                  selectedChannelId === channel.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Hash className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{channel.name}</span>
              </button>

              {isHost && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 min-h-[44px] min-w-[44px]"
                    >
                      <MoreVertical className="h-3 w-3" />
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

        <Separator className="my-2" />

        {/* Members Channels */}
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Members
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCreateMembersChannel(true)}
              className="h-5 w-5 min-h-[44px] min-w-[44px]"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {membersChannels.map((channel) => (
            <div key={channel.id.toString()} className="flex items-center group">
              <button
                onClick={() => onSelectMembersChannel(channel)}
                className={`flex-1 flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors min-h-[44px] ${
                  selectedChannelId === channel.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Hash className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{channel.name}</span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 min-h-[44px] min-w-[44px]"
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
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <UIScaleSettingsPopover />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowQuickChatProfile(true)}
          className="w-full justify-start gap-2 min-h-[44px]"
        >
          <User className="h-4 w-4" />
          <span className="truncate text-xs">{displayName}</span>
        </Button>
      </div>

      <ChannelManagementDialogs
        sessionId={sessionId}
        isCreateDialog
        open={showCreateChannel}
        onOpenChange={setShowCreateChannel}
        onSuccess={onChannelsChanged}
      />

      <MembersChannelManagementDialogs
        sessionId={sessionId}
        isCreateDialog
        open={showCreateMembersChannel}
        onOpenChange={setShowCreateMembersChannel}
        onSuccess={onMembersChannelsChanged}
      />

      <QuickChatProfileDialog
        open={showQuickChatProfile}
        onOpenChange={setShowQuickChatProfile}
        currentProfile={quickProfile}
        onSave={saveProfile}
        onClear={clearProfile}
      />
    </div>
  );
}
