import React, { useState, useRef } from 'react';
import { Image, Send, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PostItem from './PostItem';
import type { CommunityPost } from '../../backend';

interface HomeTabProps {
  communityId: string;
  accentColor?: string;
}

export default function HomeTab({ communityId, accentColor = '#7c3aed' }: HomeTabProps) {
  const { identity, login } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = !!identity;

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['communityPosts', communityId],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getPosts(communityId);
      // Sort reverse-chronological
      return [...result].sort((a, b) => Number(b.createdAt - a.createdAt));
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!content.trim()) throw new Error('Post content cannot be empty');

      let imageBytes: Uint8Array | null = null;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBytes = new Uint8Array(arrayBuffer);
      }

      const postId = await actor.createPost(communityId, content.trim(), imageBytes);
      if (!postId) throw new Error('Failed to create post');
      return postId;
    },
    onSuccess: () => {
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setPostError(null);
      queryClient.invalidateQueries({ queryKey: ['communityPosts', communityId] });
    },
    onError: (err: Error) => {
      setPostError(err.message || 'Failed to create post');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setPostError('Only PNG and JPG images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPostError('Image must be under 5MB');
      return;
    }
    setPostError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPostMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Post Creation */}
      {isAuthenticated ? (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm">
          <Textarea
            placeholder="Share something with the community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="resize-none min-h-[80px] border-0 bg-transparent focus-visible:ring-0 p-0 text-sm"
            disabled={createPostMutation.isPending}
          />

          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-40 rounded-lg object-cover"
              />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/80"
              >
                ×
              </button>
            </div>
          )}

          {postError && (
            <p className="text-xs text-destructive">{postError}</p>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={createPostMutation.isPending}
              className="text-muted-foreground hover:text-foreground"
            >
              <Image className="w-4 h-4 mr-1" />
              Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || createPostMutation.isPending}
              style={{ backgroundColor: accentColor }}
              className="text-white"
            >
              {createPostMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
          <p className="text-muted-foreground text-sm">Log in to post in this community</p>
          <Button
            size="sm"
            onClick={login}
            style={{ backgroundColor: accentColor }}
            className="text-white"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login to Post
          </Button>
        </div>
      )}

      {/* Posts Feed */}
      {postsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-1">No posts yet</p>
          <p className="text-sm">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem key={post.id} post={post} accentColor={accentColor} />
          ))}
        </div>
      )}
    </div>
  );
}
