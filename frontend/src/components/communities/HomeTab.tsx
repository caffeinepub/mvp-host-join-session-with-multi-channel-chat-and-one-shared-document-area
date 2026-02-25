import React from 'react';
import { useGetCommunityPosts } from '../../hooks/useQueries';
import PostComposer from './PostComposer';
import PostItem from './PostItem';
import { Skeleton } from '@/components/ui/skeleton';

interface HomeTabProps {
  communityId: bigint;
}

export default function HomeTab({ communityId }: HomeTabProps) {
  const { data: posts, isLoading } = useGetCommunityPosts(communityId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <PostComposer communityId={communityId} />

      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-cosmic-surface rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24 bg-white/10" />
                    <Skeleton className="h-3 w-16 bg-white/10" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full bg-white/10" />
              </div>
            ))}
          </>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => <PostItem key={post.id.toString()} post={post} />)
        ) : (
          <div className="text-center py-12 text-white/40">
            <p className="text-lg">No posts yet.</p>
            <p className="text-sm mt-1">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
