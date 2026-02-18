import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQuickChatProfile } from '../../hooks/useQuickChatProfile';
import type { Channel, MembersChannel } from '../../backend';
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
  const { profile: quickProfile, save: saveQuickProfile, clear: clearQuickProfile } = useQuickChatProfile();
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateMembersChannel, setShowCreateMembersChannel] = useState(false);
  const [showQuickProfileDialog, setShowQuickProfileDialog] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`border-r border-border bg-card flex flex-col transition-all duration-300 ${isCollapsed ? 'w-14' : 'w-64'}`}>
      {/* Toggle Button and Settings */}
      <div className={`flex items-center gap-1 ${isCollapsed ? 'justify-center' : 'justify-end'} p-2 border-b border-border`}>
        {!isCollapsed && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 min-h-[44px] min-w-[44px]"
                    onClick={() => setShowQuickProfileDialog(true)}
                    aria-label="Open quick profile"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Quick profile
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <UIScaleSettingsPopover />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  UI Scale Settings
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 min-h-[44px] min-w-[44px]"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {!isCollapsed && (
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
                    className="h-8 w-8 p-0 min-h-[44px] min-w-[44px]"
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
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors min-h-[44px] ${
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
                  className="h-8 w-8 p-0 min-h-[44px] min-w-[44px]"
                  onClick={() => setShowCreateMembersChannel(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {membersChannels.map((channel) => {
                  const isCreator = identity && channel.createdBy.toString() === identity.getPrincipal().toString();
                  return (
                    <div
                      key={channel.id.toString()}
                      className={`flex items-center gap-1 rounded ${
                        selectedChannelId === channel.id ? 'bg-accent' : ''
                      }`}
                    >
                      <button
                        onClick={() => onSelectMembersChannel(channel)}
                        className={`flex-1 flex items-center gap-2 px-2 py-2 text-sm transition-colors min-h-[44px] ${
                          selectedChannelId === channel.id
                            ? 'text-accent-foreground'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        <Hash className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{channel.name}</span>
                      </button>
                      {(isCreator || isHost) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 mr-1 min-h-[44px] min-w-[44px]"
                            >
                              <MoreVertical className="h-4 w-4" />
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
      )}

      {/* Dialogs */}
      <ChannelManagementDialogs
        sessionId={sessionId}
        isCreateDialog={true}
        open={showCreateChannel}
        onOpenChange={setShowCreateChannel}
        onSuccess={onChannelsChanged}
      />

      <MembersChannelManagementDialogs
        sessionId={sessionId}
        isCreateDialog={true}
        open={showCreateMembersChannel}
        onOpenChange={setShowCreateMembersChannel}
        onSuccess={onMembersChannelsChanged}
      />

      <QuickChatProfileDialog
        open={showQuickProfileDialog}
        onOpenChange={setShowQuickProfileDialog}
        currentProfile={quickProfile}
        onSave={saveQuickProfile}
        onClear={clearQuickProfile}
      />
    </aside>
  );
}
