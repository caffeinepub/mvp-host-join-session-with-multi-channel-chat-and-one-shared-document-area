import React from 'react';
import { Shield } from 'lucide-react';

export default function RulesTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <Shield size={36} className="text-red-400/60" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Rules</h2>
      <p className="text-white/50 text-base max-w-xs">
        Community guidelines and rules will appear here. Please respect all members.
      </p>
      <div className="mt-6 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium">
        Coming Soon
      </div>
    </div>
  );
}
