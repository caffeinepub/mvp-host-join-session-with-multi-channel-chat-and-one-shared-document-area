import { useState, useEffect, useRef } from 'react';
import { useActor } from '../../hooks/useActor';
import type { Message, SessionMember } from '../../backend';
import { ExternalBlob } from '../../backend';
import ChatMessageItem from './ChatMessageItem';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Loader2, Image, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { parseRollCommand } from '../../lib/rollCommand';

type ChannelChatViewProps = {
  sessionId: bigint;
  channelId: bigint;
  channelName: string;
  nickname: string;
  messages: Message[];
  members: SessionMember[];
  onMessagesChanged: () => void;
};

export default function ChannelChatView({
  sessionId,
  channelId,
  channelName,
  nickname,
  messages,
  members,
  onMessagesChanged,
}: ChannelChatViewProps) {
  const { actor } = useActor();
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Create a lookup map for messages
  const messagesMap = new Map<string, Message>();
  messages.forEach((msg) => {
    messagesMap.set(msg.id.toString(), msg);
  });

  const handleSendMessage = async () => {
    if (!actor || !messageInput.trim() || isSending) return;

    const content = messageInput.trim();
    const replyToId = replyTarget?.id || null;
    setIsSending(true);

    try {
      // Check if it's a roll command
      if (content.startsWith('/roll ')) {
        const pattern = content.substring(6).trim();
        const validation = parseRollCommand(pattern);

        if (!validation.valid) {
          alert(validation.error);
          setIsSending(false);
          return;
        }

        // Execute roll
        const result = await actor.roll(sessionId, pattern);
        
        // Post roll result as message
        const rollMessage = `🎲 ${nickname} rolled ${result.pattern}: ${result.rolls.map(r => r.toString()).join(', ')}${result.modifier !== 0n ? ` ${result.modifier > 0n ? '+' : ''}${result.modifier}` : ''} = **${result.total}**`;
        await actor.postMessage(sessionId, channelId, rollMessage, null, replyToId);
      } else {
        // Regular message
        await actor.postMessage(sessionId, channelId, content, null, replyToId);
      }

      setMessageInput('');
      setReplyTarget(null);
      onMessagesChanged();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !actor) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Image size must not exceed 10MB.');
      return;
    }

    setIsSending(true);
    setUploadProgress(0);

    try {
      // Read file as bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with upload progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Post message with image attachment
      const content = messageInput.trim() || '📷 Image';
      const replyToId = replyTarget?.id || null;
      await actor.postMessage(sessionId, channelId, content, blob, replyToId);

      // Clear input and reset state
      setMessageInput('');
      setReplyTarget(null);
      setUploadProgress(null);
      onMessagesChanged();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
      setUploadProgress(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleLongPress = (message: Message) => {
    setReplyTarget(message);
  };

  const clearReplyTarget = () => {
    setReplyTarget(null);
  };

  const truncateText = (text: string, maxLength: number = 60): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Channel Header */}
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-xl font-semibold">#{channelName}</h2>
        <p className="text-sm text-muted-foreground">
          {messages.length} messages
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessageItem
                key={message.id.toString()}
                message={message}
                members={members}
                currentNickname={nickname}
                messagesMap={messagesMap}
                onLongPress={handleLongPress}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border px-6 py-4">
        {/* Reply Preview */}
        {replyTarget && (
          <div className="mb-3 bg-muted/50 rounded-lg p-3 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">You replied</p>
              <p className="text-sm text-foreground line-clamp-2">
                {truncateText(replyTarget.content || '📷 Image')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={clearReplyTarget}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message... (Use /roll d20 for dice)"
            className="resize-none"
            rows={2}
            disabled={isSending}
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleImageButtonClick}
              disabled={isSending}
              size="icon"
              variant="outline"
              title="Upload image"
            >
              {uploadProgress !== null ? (
                <span className="text-xs font-medium">{Math.round(uploadProgress)}%</span>
              ) : (
                <Image className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              size="icon"
              className="self-end"
            >
              {isSending && uploadProgress === null ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Use the Send button to send your message or the image button to upload a picture
        </p>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
