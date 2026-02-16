import { useState, useEffect, useRef } from 'react';
import { useActor } from '../../hooks/useActor';
import type { Message, SessionMember } from '../../backend';
import ChatMessageItem from './ChatMessageItem';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Loader2 } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!actor || !messageInput.trim() || isSending) return;

    const content = messageInput.trim();
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
        await actor.postMessage(sessionId, channelId, rollMessage);
      } else {
        // Regular message
        await actor.postMessage(sessionId, channelId, content);
      }

      setMessageInput('');
      onMessagesChanged();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
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
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex gap-2">
          <Textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message... (Use /roll d20 for dice)"
            className="resize-none"
            rows={2}
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            size="icon"
            className="self-end"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Use the Send button to send your message
        </p>
      </div>
    </div>
  );
}
