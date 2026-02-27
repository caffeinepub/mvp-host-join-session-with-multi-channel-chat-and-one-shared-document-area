import React from 'react';

interface TabPlaceholderProps {
  tabName: string;
  accentColor?: string;
  description?: string;
  icon?: string;
}

export default function TabPlaceholder({
  tabName,
  accentColor = '#7c3aed',
  description = 'This feature is coming soon.',
  icon = '🚀',
}: TabPlaceholderProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg"
        style={{ backgroundColor: `${accentColor}20`, border: `2px solid ${accentColor}40` }}
      >
        {icon}
      </div>

      <h2
        className="text-2xl font-bold mb-3"
        style={{ color: accentColor }}
      >
        {tabName}
      </h2>

      <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
        {description}
      </p>

      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
        style={{
          backgroundColor: `${accentColor}15`,
          border: `1px solid ${accentColor}40`,
          color: accentColor,
        }}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: accentColor }}
        />
        Coming Soon
      </div>
    </div>
  );
}
