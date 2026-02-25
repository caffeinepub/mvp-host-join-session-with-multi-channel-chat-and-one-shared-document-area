import React from 'react';
import { Users } from 'lucide-react';

interface CommunityStatsBarProps {
  memberCount: number;
}

export default function CommunityStatsBar({ memberCount }: CommunityStatsBarProps) {
  return (
    <div className="w-full bg-cosmic-surface border-b border-cosmic-border px-4 py-3 flex items-center gap-3">
      <Users size={20} className="text-cosmic-accent shrink-0" />
      <span className="text-white font-semibold text-sm">
        Active Adventurers:{' '}
        <span className="text-cosmic-accent font-bold">{memberCount}</span>
      </span>
    </div>
  );
}
