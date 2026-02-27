import React from 'react';
import { Lock } from 'lucide-react';

const MOCK_MESSAGES = [
  { id: 1, name: 'Member A', text: 'Hey everyone! 👋', time: '2:30 PM', isOwn: false },
  { id: 2, name: 'Member B', text: 'Welcome to the community!', time: '2:31 PM', isOwn: false },
  { id: 3, name: 'You', text: 'Thanks, excited to be here!', time: '2:32 PM', isOwn: true },
  { id: 4, name: 'Member A', text: 'Feel free to ask anything 😊', time: '2:33 PM', isOwn: false },
];

export default function ChatTabPlaceholder() {
  return (
    <div className="relative max-w-2xl mx-auto h-[calc(100vh-320px)] min-h-[400px] flex flex-col">
      {/* Greyed-out chat UI */}
      <div className="flex-1 overflow-hidden px-4 py-4 space-y-3 opacity-30 pointer-events-none select-none">
        {MOCK_MESSAGES.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {!msg.isOwn && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                {msg.name[0]}
              </div>
            )}
            <div
              className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                msg.isOwn
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              }`}
            >
              {!msg.isOwn && (
                <p className="text-xs font-semibold mb-0.5 opacity-70">{msg.name}</p>
              )}
              <p>{msg.text}</p>
              <p className="text-xs opacity-50 mt-0.5 text-right">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Disabled input bar */}
      <div className="px-4 pb-4 opacity-30 pointer-events-none select-none">
        <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2.5">
          <span className="flex-1 text-sm text-muted-foreground">Type a message...</span>
          <div className="w-8 h-8 rounded-full bg-primary/50 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl px-8 py-6 text-center shadow-xl max-w-xs mx-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-foreground text-lg mb-2">Private Messaging</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Direct messaging is coming soon. Stay tuned for updates!
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
