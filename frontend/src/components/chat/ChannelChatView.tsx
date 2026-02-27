import { useState, useEffect, useRef } from 'react';
import { useActor } from '../../hooks/useActor';
import type { Message, SessionMember } from '../../types/session';
import { ExternalBlob } from '../../backend';
import ChatMessageItem from './ChatMessageItem';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Loader2, Image, X, ArrowDown, Smile, Settings } from 'lucide-react';
import { parseRollCommand } from '../../lib/rollCommand';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import StickerPickerPanel from './StickerPickerPanel';
import StickerManagementPanel from './StickerManagementPanel';
import { dataUrlToUint8Array } from '../../lib/stickerImageProcessor';
import type { StickerData } from '../../lib/stickerStorage';
import { validateGifUrl, extractGifUrl } from '../../lib/gifUrlValidation';
import { toast } from 'sonner';

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
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showStickerManager, setShowStickerManager] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevChannelIdRef = useRef<bigint | null>(null);

  useEffect(() => {
    const channelChanged = prevChannelIdRef.current !== null && prevChannelIdRef.current !== channelId;
    prevChannelIdRef.current = channelId;

    if (scrollRef.current && (autoScroll || channelChanged)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, channelId, autoScroll]);

  const handleSendMessage = async () => {
    if (!actor || !messageInput.trim()) return;

    const content = messageInput.trim();
    setIsSending(true);

    try {
      const gifUrl = extractGifUrl(content);

      if (gifUrl) {
        const validation = validateGifUrl(gifUrl);

        if (validation.valid) {
          await (actor as any).postMessage(sessionId, channelId, content, null, gifUrl, replyTarget?.id || null);
          setMessageInput('');
          setReplyTarget(null);
          onMessagesChanged();
          setIsSending(false);
          return;
        } else {
          toast.error(validation.error || 'Invalid GIF URL');
          setIsSending(false);
          return;
        }
      }

      if (content.startsWith('/roll ')) {
        const pattern = content.substring(6).trim();
        const validation = parseRollCommand(pattern);

        if (!validation.valid) {
          toast.error(validation.error || 'Invalid roll command');
          setIsSending(false);
          return;
        }

        const result = await (actor as any).roll(sessionId, pattern);
        const rollMessage = `🎲 **${nickname}** rolled ${result.pattern}: ${result.rolls.map((r: any) => r.toString()).join(', ')}${result.modifier !== 0n ? ` ${result.modifier > 0n ? '+' : ''}${result.modifier}` : ''} = **${result.total}**`;

        await (actor as any).postMessage(sessionId, channelId, rollMessage, null, null, replyTarget?.id || null);
      } else {
        await (actor as any).postMessage(sessionId, channelId, content, null, null, replyTarget?.id || null);
      }

      setMessageInput('');
      setReplyTarget(null);
      onMessagesChanged();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !actor) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
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
      await (actor as any).postMessage(sessionId, channelId, caption, blob, null, replyTarget?.id || null);

      setMessageInput('');
      setReplyTarget(null);
      onMessagesChanged();
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsSending(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStickerSelect = async (sticker: StickerData) => {
    if (!actor) return;

    setIsSending(true);
    setUploadProgress(0);

    try {
      const bytes = dataUrlToUint8Array(sticker.dataUrl);

      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const stickerId = await (actor as any).addSticker(blob, sticker.name);

      if (stickerId === null) {
        throw new Error('Failed to add sticker to backend');
      }

      const messageId = BigInt(Date.now());
      const timestamp = BigInt(Date.now() * 1000000);

      await (actor as any).sendSticker(stickerId, channelId, nickname, messageId, timestamp);

      await (actor as any).postMessage(
        sessionId,
        channelId,
        `[STICKER:${sticker.name}]`,
        blob,
        null,
        replyTarget?.id || null
      );

      setReplyTarget(null);
      onMessagesChanged();
    } catch (error) {
      console.error('Failed to send sticker:', error);
      toast.error('Failed to send sticker');
    } finally {
      setIsSending(false);
      setUploadProgress(null);
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
      <div className="border-b border-border bg-card px-4 py-3 flex-shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-muted-foreground">#</span>
          {channelName}
        </h2>
      </div>

      <div className="chat-messages-scroll" ref={scrollRef}>
        <div className="py-4 px-2 md:px-4 space-y-4">
          {messages.map((message) => (
            <ChatMessageItem
              key={message.id.toString()}
              message={message}
              onLongPress={handleLongPress}
            />
          ))}
        </div>
      </div>

      {replyTarget && (
        <div className="px-2 md:px-4 py-2 bg-muted/50 border-t border-border flex items-center justify-between flex-shrink-0">
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
            className="ml-2 min-h-[44px] min-w-[44px]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="border-t border-border bg-card p-2 md:p-4 flex-shrink-0 relative">
        {showStickerPicker && (
          <StickerPickerPanel
            onClose={() => setShowStickerPicker(false)}
            onStickerSelect={handleStickerSelect}
          />
        )}
        {showStickerManager && (
          <StickerManagementPanel
            onClose={() => setShowStickerManager(false)}
          />
        )}

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
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setShowStickerManager(false);
              setShowStickerPicker(!showStickerPicker);
            }}
            disabled={isSending}
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setShowStickerPicker(false);
              setShowStickerManager(!showStickerManager);
            }}
            disabled={isSending}
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Textarea
            placeholder={`Message #${channelName}, paste GIF URL, or /roll 2d6+3`}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            disabled={isSending}
            className="min-h-[60px] max-h-[120px] resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !messageInput.trim()}
            size="icon"
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-h-[44px]">
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
              className="text-xs min-h-[44px]"
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
