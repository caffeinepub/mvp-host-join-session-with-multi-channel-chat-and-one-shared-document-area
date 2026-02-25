import React, { useState } from 'react';

/**
 * Represents a parsed token from document content
 */
type Token = {
  type: 'text' | 'file-marker';
  content: string;
  fileId?: number;
  filename?: string;
};

/**
 * Parse content into tokens (text and file markers)
 */
export function tokenizeContent(content: string): Token[] {
  const tokens: Token[] = [];
  const fileMarkerRegex = /\[FILE:(\d+):([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = fileMarkerRegex.exec(content)) !== null) {
    // Add text before marker
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add file marker
    tokens.push({
      type: 'file-marker',
      content: match[0],
      fileId: parseInt(match[1], 10),
      filename: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    tokens.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return tokens;
}

/**
 * Represents a line with its prefix and content
 */
type ParsedLine = {
  prefix: 'center' | 'big' | 'heading' | 'tiny' | null;
  content: string;
};

/**
 * Parse a line to extract prefix markup
 */
function parseLine(line: string): ParsedLine {
  const trimmed = line.trimStart();
  
  if (trimmed.startsWith('[C] ')) {
    return { prefix: 'center', content: trimmed.slice(4) };
  }
  if (trimmed.startsWith('[B] ')) {
    return { prefix: 'big', content: trimmed.slice(4) };
  }
  if (trimmed.startsWith('# ')) {
    return { prefix: 'heading', content: trimmed.slice(2) };
  }
  if (trimmed.startsWith('-# ')) {
    return { prefix: 'tiny', content: trimmed.slice(3) };
  }
  
  return { prefix: null, content: line };
}

/**
 * Component for rendering spoiler text
 */
function SpoilerText({ children }: { children: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      onClick={() => setRevealed(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setRevealed(true);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Click to reveal spoiler"
      className={`${
        revealed
          ? 'bg-transparent text-foreground'
          : 'bg-foreground text-foreground cursor-pointer hover:bg-foreground/80'
      } px-1 rounded transition-colors select-none`}
      style={revealed ? {} : { userSelect: 'none' }}
    >
      {children}
    </span>
  );
}

/**
 * Parse and render inline markup (spoilers and underlines)
 */
export function renderInlineMarkup(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // Combined regex for spoilers and underlines
  const inlineRegex = /(\|\|[^|]+\|\|)|(__[^_]+__)/g;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const matched = match[0];
    
    if (matched.startsWith('||') && matched.endsWith('||')) {
      // Spoiler
      const spoilerContent = matched.slice(2, -2);
      nodes.push(<SpoilerText key={`spoiler-${key++}`}>{spoilerContent}</SpoilerText>);
    } else if (matched.startsWith('__') && matched.endsWith('__')) {
      // Underline
      const underlineContent = matched.slice(2, -2);
      nodes.push(
        <span key={`underline-${key++}`} className="underline">
          {underlineContent}
        </span>
      );
    }

    lastIndex = match.index + matched.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

/**
 * Render a text segment with line-aware markup
 */
export function renderTextSegment(text: string): React.ReactNode {
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    const parsed = parseLine(line);
    const inlineContent = renderInlineMarkup(parsed.content);
    
    // Apply line prefix styling
    let className = 'leading-relaxed';
    
    switch (parsed.prefix) {
      case 'center':
        className += ' text-center';
        break;
      case 'big':
        className += ' text-lg font-medium';
        break;
      case 'heading':
        className += ' text-2xl font-bold';
        break;
      case 'tiny':
        className += ' text-xs';
        break;
    }
    
    return (
      <div key={lineIndex} className={className}>
        {inlineContent}
      </div>
    );
  });
}
