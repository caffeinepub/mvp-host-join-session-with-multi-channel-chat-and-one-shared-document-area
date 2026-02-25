import React from 'react';
import { CommunityPost } from '../../backend';
import { formatTimestamp } from '../../lib/time';

interface PostItemProps {
  post: CommunityPost;
}

export default function PostItem({ post }: PostItemProps) {
  const imageUrl = post.image ? post.image.getDirectURL() : null;
  const initial = post.authorName.charAt(0).toUpperCase();
  const timeStr = formatTimestamp(post.timestamp);

  return (
    <article className="bg-cosmic-surface border border-cosmic-border rounded-xl p-4 space-y-3 hover:border-cosmic-accent/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-cosmic-accent/30 flex items-center justify-center text-cosmic-accent font-bold text-sm shrink-0">
          {initial}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{post.authorName}</p>
          <p className="text-white/40 text-xs">{timeStr}</p>
        </div>
      </div>

      {post.text && (
        <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p>
      )}

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Post image"
          className="w-full max-h-96 object-cover rounded-lg border border-white/10"
        />
      )}
    </article>
  );
}
