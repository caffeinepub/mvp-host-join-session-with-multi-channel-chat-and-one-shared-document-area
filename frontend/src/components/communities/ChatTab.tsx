import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function ChatTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-cosmic-accent/10 border border-cosmic-accent/20 flex items-center justify-center mb-6">
        <MessageCircle size={36} className="text-cosmic-accent/60" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Chat</h2>
      <p className="text-white/50 text-base max-w-xs">
        Real-time community chat is coming soon. Stay tuned for updates!
      </p>
      <div className="mt-6 px-4 py-2 bg-cosmic-accent/10 border border-cosmic-accent/20 rounded-full text-cosmic-accent text-sm font-medium">
        Coming Soon
      </div>
    </div>
  );
}
