import { useRef, useEffect, useState } from 'react';
import type { Message, SessionMember } from '../../backend';
import { formatTimestamp } from '../../lib/time';
import { Badge } from '../ui/badge';
import Avatar from '../profile/Avatar';
import { useGetUserProfile } from '../../hooks/useUserProfile';

type ChatMessageItemProps = {
  message: Message;
  members: SessionMember[];
  currentNickname: string;
  messagesMap: Map<string, Message>;
  onLongPress: (message: Message) => void;
};

export default function ChatMessageItem({
  message,
  members,
  currentNickname,
  messagesMap,
  onLongPress,
}: ChatMessageItemProps) {
  const isRoll = message.content.startsWith('🎲');
  const hasImage = !!message.image;
  const isCurrentUser = message.author === currentNickname;

  // Find the member by nickname to get their principal
  const member = members.find((m) => m.nickname === message.author);
  const { data: userProfile } = useGetUserProfile(member?.id || null);

  const avatarImageUrl = userProfile?.profilePicture?.getDirectURL();
  const messageImageUrl = message.image?.getDirectURL();

  // Long-press detection
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY };
    setIsLongPressing(false);
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      onLongPress(message);
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartRef.current = null;
    setIsLongPressing(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (touchStartRef.current) {
      const dx = e.clientX - touchStartRef.current.x;
      const dy = e.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 10) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        touchStartRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Resolve reply target
  const replyToMessage = message.replyToId
    ? messagesMap.get(message.replyToId.toString())
    : null;

  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'pan-y' }}
    >
      <Avatar
        imageUrl={avatarImageUrl}
        name={message.author}
        size="sm"
        className="mt-1 shrink-0"
      />
      <div className={`flex-1 flex flex-col gap-2 min-w-0 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {/* Reply Indicator */}
        {replyToMessage && (
          <button
            className="chat-reply-indicator"
            onClick={() => {
              // Future: scroll to original message
            }}
          >
            <div className="font-bold text-white text-xs">Replay message</div>
            <div className="text-white text-xs line-clamp-2 opacity-90">
              {truncateText(replyToMessage.content || '📷 Image')}
            </div>
          </button>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          } ${isRoll ? 'border-2 border-accent' : ''}`}
        >
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <span className="font-semibold text-xs">{message.author}</span>
            <span className="text-xs opacity-70">
              {formatTimestamp(message.timestamp)}
            </span>
            {isRoll && <Badge variant="secondary" className="text-xs">Roll</Badge>}
            {hasImage && <Badge variant="outline" className="text-xs">📷</Badge>}
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
              className="block mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={messageImageUrl}
                alt="Uploaded image"
                className="rounded-lg border border-border max-h-64 w-auto object-contain hover:opacity-90 transition-opacity cursor-pointer"
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
