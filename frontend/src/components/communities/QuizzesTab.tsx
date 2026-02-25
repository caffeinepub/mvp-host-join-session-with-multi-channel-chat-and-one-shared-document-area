import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function QuizzesTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
        <HelpCircle size={36} className="text-blue-400/60" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Quizzes</h2>
      <p className="text-white/50 text-base max-w-xs">
        Test your knowledge with community quizzes. Challenges and trivia coming soon!
      </p>
      <div className="mt-6 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
        Coming Soon
      </div>
    </div>
  );
}
