import { useState, useEffect, useRef } from 'react';
import { useActor } from '../../hooks/useActor';
import type { Message, SessionMember } from '../../backend';
import { ExternalBlob } from '../../backend';
import ChatMessageItem from './ChatMessageItem';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Loader2, Image, X, ArrowDown } from 'lucide-react';
import { parseRollCommand } from '../../lib/rollCommand';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

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
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevChannelIdRef = useRef<bigint | null>(null);

  // Auto-scroll to bottom when messages change or channel changes (only if enabled)
  useEffect(() => {
    const channelChanged = prevChannelIdRef.current !== null && prevChannelIdRef.current !== channelId;
    prevChannelIdRef.current = channelId;

    if (scrollRef.current && (autoScroll || channelChanged)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, channelId, autoScroll]);

  // Create a lookup map for messages
  const messagesMap = new Map<string, Message>();
  messages.forEach((msg) => {
    messagesMap.set(msg.id.toString(), msg);
  });

  const handleSendMessage = async () => {
    if (!actor || !messageInput.trim()) return;

    const content = messageInput.trim();
    setIsSending(true);

    try {
      // Check if it's a roll command
      if (content.startsWith('/roll ')) {
        const pattern = content.substring(6).trim();
        const validation = parseRollCommand(pattern);

        if (!validation.valid) {
          alert(validation.error || 'Invalid roll command');
          setIsSending(false);
          return;
        }

        const result = await actor.roll(sessionId, pattern);
        const rollMessage = `🎲 **${nickname}** rolled ${result.pattern}: ${result.rolls.map((r) => r.toString()).join(', ')}${result.modifier !== 0n ? ` ${result.modifier > 0n ? '+' : ''}${result.modifier}` : ''} = **${result.total}**`;

        await actor.postMessage(sessionId, channelId, rollMessage, null, replyTarget?.id || null);
      } else {
        await actor.postMessage(sessionId, channelId, content, null, replyTarget?.id || null);
      }

      setMessageInput('');
      setReplyTarget(null);
      onMessagesChanged();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !actor) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setIsSending(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const caption = messageInput.trim() || '';
      await actor.postMessage(sessionId, channelId, caption, blob, replyTarget?.id || null);

      setMessageInput('');
      setReplyTarget(null);
      onMessagesChanged();
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setIsSending(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLongPress = (message: Message) => {
    setReplyTarget(message);
  };

  const handleCancelReply = () => {
    setReplyTarget(null);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  return (
    <div className="chat-view-container">
      {/* Channel Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex-shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-muted-foreground">#</span>
          {channelName}
        </h2>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-scroll" ref={scrollRef}>
        <div className="py-4 px-4 space-y-4">
          {messages.map((message) => (
            <ChatMessageItem
              key={message.id.toString()}
              message={message}
              members={members}
              currentNickname={nickname}
              messagesMap={messagesMap}
              onLongPress={handleLongPress}
            />
          ))}
        </div>
      </div>

      {/* Reply Preview */}
      {replyTarget && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border flex items-center justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              Replying to {replyTarget.author}
            </p>
            <p className="text-sm truncate">
              {replyTarget.content || '📷 Image'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelReply}
            className="ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4 flex-shrink-0">
        <div className="flex gap-2 mb-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Textarea
            placeholder={`Message #${channelName} or /roll 2d6+3`}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="min-h-[60px] max-h-[120px] resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !messageInput.trim()}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Auto-scroll toggle and scroll to bottom button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-scroll"
              checked={autoScroll}
              onCheckedChange={setAutoScroll}
              aria-label="Toggle auto-scroll"
            />
            <Label htmlFor="auto-scroll" className="text-xs text-muted-foreground cursor-pointer">
              Auto-scroll
            </Label>
          </div>
          
          {!autoScroll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToBottom}
              className="text-xs"
            >
              <ArrowDown className="h-3 w-3 mr-1" />
              Scroll to bottom
            </Button>
          )}
        </div>

        {uploadProgress !== null && (
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Uploading: {uploadProgress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
