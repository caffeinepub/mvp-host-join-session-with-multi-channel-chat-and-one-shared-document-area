import type { Message, SessionMember } from '../../backend';
import { formatTimestamp } from '../../lib/time';
import { Badge } from '../ui/badge';
import Avatar from '../profile/Avatar';
import { useGetUserProfile } from '../../hooks/useUserProfile';

type ChatMessageItemProps = {
  message: Message;
  members: SessionMember[];
};

export default function ChatMessageItem({ message, members }: ChatMessageItemProps) {
  const isRoll = message.content.startsWith('🎲');
  const hasImage = !!message.image;

  // Find the member by nickname to get their principal
  const member = members.find((m) => m.nickname === message.author);
  const { data: userProfile } = useGetUserProfile(member?.id || null);

  const avatarImageUrl = userProfile?.profilePicture?.getDirectURL();
  const messageImageUrl = message.image?.getDirectURL();

  return (
    <div className={`flex gap-3 ${isRoll ? 'bg-accent/30 p-3 rounded-lg border border-accent' : ''}`}>
      <Avatar
        imageUrl={avatarImageUrl}
        name={message.author}
        size="sm"
        className="mt-1"
      />
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-sm">{message.author}</span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
          {isRoll && <Badge variant="secondary" className="text-xs">Roll</Badge>}
          {hasImage && <Badge variant="outline" className="text-xs">📷 Image</Badge>}
        </div>
        {message.content && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content.replace(/\*\*(.*?)\*\*/g, (_, text) => text)}
          </div>
        )}
        {hasImage && messageImageUrl && (
          <a
            href={messageImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-md"
          >
            <img
              src={messageImageUrl}
              alt="Uploaded image"
              className="rounded-lg border border-border max-h-96 w-auto object-contain hover:opacity-90 transition-opacity cursor-pointer"
            />
          </a>
        )}
      </div>
    </div>
  );
}
