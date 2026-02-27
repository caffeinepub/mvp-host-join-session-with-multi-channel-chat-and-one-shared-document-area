import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { CommunityPost } from '../../backend';

interface PostItemProps {
  post: CommunityPost;
  accentColor?: string;
}

function formatTimestamp(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  const date = new Date(ms);
  const now = Date.now();
  const diff = now - ms;

  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString();
}

function shortenPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
}

export default function PostItem({ post, accentColor = '#7c3aed' }: PostItemProps) {
  const { actor, isFetching: actorFetching } = useActor();

  const authorPrincipalStr = post.authorPrincipal.toString();

  const { data: authorProfile } = useQuery({
    queryKey: ['userProfile', authorPrincipalStr],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile(post.authorPrincipal);
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
  });

  const authorName = authorProfile?.name || shortenPrincipal(authorPrincipalStr);

  const imageUrl = useMemo(() => {
    if (!post.imageBlob || post.imageBlob.length === 0) return null;
    const blob = new Blob([new Uint8Array(post.imageBlob)], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }, [post.imageBlob]);

  const initials = authorName.slice(0, 2).toUpperCase();

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm">
      {/* Author row */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{authorName}</p>
          <p className="text-xs text-muted-foreground">{formatTimestamp(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Post image"
          className="w-full max-h-80 object-cover rounded-lg"
        />
      )}
    </div>
  );
}
