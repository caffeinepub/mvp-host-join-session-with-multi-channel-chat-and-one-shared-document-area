import React from 'react';
import { BarChart2 } from 'lucide-react';

export default function PollsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
        <BarChart2 size={36} className="text-green-400/60" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Polls</h2>
      <p className="text-white/50 text-base max-w-xs">
        Community polls and voting will appear here. Cast your vote and shape the community!
      </p>
      <div className="mt-6 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium">
        Coming Soon
      </div>
    </div>
  );
}
