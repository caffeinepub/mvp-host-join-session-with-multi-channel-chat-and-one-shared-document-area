import { useState, useEffect, useRef } from 'react';
import type { Message, SessionMember } from '../../types/session';
import { ExternalBlob } from '../../backend';
import ChatMessageItem from './ChatMessageItem';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Loader2, Image, X, ArrowDown, Smile, Settings } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import StickerPickerPanel from './StickerPickerPanel';
import StickerManagementPanel from './StickerManagementPanel';
import type { StickerData } from '../../lib/stickerStorage';
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
    const channelChanged =
      prevChannelIdRef.current !== null && prevChannelIdRef.current !== channelId;
    prevChannelIdRef.current = channelId;
    if (scrollRef.current && (autoScroll || channelChanged)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, channelId, autoScroll]);

  const handleSendMessage = async () => {
    toast.info('Chat is not available in the current version.');
  };

  const handleImageUpload = async (_e: React.ChangeEvent<HTMLInputElement>) => {
    toast.info('Image upload is not available in the current version.');
  };

  const handleStickerSelect = async (_sticker: StickerData) => {
    toast.info('Stickers are not available in the current version.');
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
      <div className="border-b border-border bg-card px-4 py-3 shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-muted-foreground">#</span>
          {channelName}
        </h2>
      </div>

      <div className="chat-messages-scroll" ref={scrollRef}>
        <div className="py-4 px-2 md:px-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Chat functionality is coming soon.</p>
            </div>
          )}
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
        <div className="px-2 md:px-4 py-2 bg-muted/50 border-t border-border flex items-center justify-between shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              Replying to {replyTarget.author}
            </p>
            <p className="text-sm truncate">{replyTarget.content || '📷 Image'}</p>
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

      <div className="border-t border-border bg-card p-2 md:p-4 shrink-0 relative">
        {showStickerPicker && (
          <StickerPickerPanel
            onClose={() => setShowStickerPicker(false)}
            onStickerSelect={handleStickerSelect}
          />
        )}
        {showStickerManager && (
          <StickerManagementPanel onClose={() => setShowStickerManager(false)} />
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
            placeholder={`Message #${channelName}`}
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
            <p className="text-xs text-muted-foreground mt-1">Uploading: {uploadProgress}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
