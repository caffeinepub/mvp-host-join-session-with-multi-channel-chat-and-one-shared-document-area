import { useState } from 'react';
import { formatTimestamp } from '../../lib/time';
import type { Message } from '../../types/session';
import Avatar from '../profile/Avatar';
import { Smile } from 'lucide-react';
import { Button } from '../ui/button';

type ChatMessageItemProps = {
  message: Message;
  onReply?: (message: Message) => void;
  onLongPress?: (message: Message) => void;
  showAvatar?: boolean;
  userProfilePicture?: string | null;
};

export default function ChatMessageItem({
  message,
  onReply,
  onLongPress,
  showAvatar = true,
  userProfilePicture,
}: ChatMessageItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactions, setReactions] = useState<{ emoji: string; count: number }[]>([]);

  const isSticker = message.content.startsWith('[STICKER:');
  const isGif = message.gif !== undefined && message.gif !== null;

  const handleAddReaction = (emoji: string) => {
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) {
        return prev.map((r) =>
          r.emoji === emoji ? { ...r, count: r.count + 1 } : r
        );
      }
      return [...prev, { emoji, count: 1 }];
    });
    setShowReactionPicker(false);
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  return (
    <div className="amino-message-bubble-container group">
      {showAvatar && (
        <div className="flex-shrink-0">
          <Avatar
            name={message.author}
            imageUrl={userProfilePicture}
            size="sm"
            className="w-10 h-10"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white/80 mb-1 px-1">
          {message.author}
        </div>

        <div className="amino-message-bubble">
          {isSticker ? (
            <img
              src={message.content.replace('[STICKER:', '').replace(']', '')}
              alt="Sticker"
              className="w-32 h-32 object-contain"
            />
          ) : isGif ? (
            <img
              src={message.gif}
              alt="GIF"
              className="max-w-full rounded-lg"
              style={{ maxHeight: '320px' }}
            />
          ) : (
            <p className="text-sm text-white break-words whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          <div className="text-xs text-white/50 mt-1">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>

        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 px-1">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                className="amino-reaction-badge"
                onClick={() => handleAddReaction(reaction.emoji)}
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs font-semibold">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {showReactionPicker && (
          <div className="amino-reaction-picker">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddReaction(emoji)}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity min-h-[32px] min-w-[32px] p-1"
        onClick={() => setShowReactionPicker(!showReactionPicker)}
      >
        <Smile className="h-4 w-4 text-white/60" />
      </Button>
    </div>
  );
}
