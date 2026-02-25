import React from 'react';
import { BookOpen } from 'lucide-react';

export default function LoreTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
        <BookOpen size={36} className="text-amber-400/60" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Lore</h2>
      <p className="text-white/50 text-base max-w-xs">
        Discover the rich history and stories of this community. Lore entries coming soon.
      </p>
      <div className="mt-6 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium">
        Coming Soon
      </div>
    </div>
  );
}
