import type { Message, SessionMember } from '../../backend';
import { formatTimestamp } from '../../lib/time';
import { Badge } from '../ui/badge';
import Avatar from '../profile/Avatar';
import { useGetUserProfile } from '../../hooks/useUserProfile';
import type { Principal } from '@icp-sdk/core/principal';

type ChatMessageItemProps = {
  message: Message;
  members: SessionMember[];
};

export default function ChatMessageItem({ message, members }: ChatMessageItemProps) {
  const isRoll = message.content.startsWith('🎲');

  // Find the member by nickname to get their principal
  const member = members.find((m) => m.nickname === message.author);
  const { data: userProfile } = useGetUserProfile(member?.id || null);

  const avatarImageUrl = userProfile?.profilePicture?.getDirectURL();

  return (
    <div className={`flex gap-3 ${isRoll ? 'bg-accent/30 p-3 rounded-lg border border-accent' : ''}`}>
      <Avatar
        imageUrl={avatarImageUrl}
        name={message.author}
        size="sm"
        className="mt-1"
      />
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-sm">{message.author}</span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
          {isRoll && <Badge variant="secondary" className="text-xs">Roll</Badge>}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content.replace(/\*\*(.*?)\*\*/g, (_, text) => text)}
        </div>
      </div>
    </div>
  );
}
