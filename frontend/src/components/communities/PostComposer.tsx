import React, { useState, useRef } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useCreateCommunityPost } from '../../hooks/useQueries';
import { useGetCallerUserProfile } from '../../hooks/useUserProfile';
import { ExternalBlob } from '../../backend';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, X, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface PostComposerProps {
  communityId: bigint;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export default function PostComposer({ communityId }: PostComposerProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const createPost = useCreateCommunityPost(communityId);

  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authorName =
    userProfile?.name ??
    identity?.getPrincipal().toString().slice(0, 8) ??
    'Anonymous';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only PNG, JPG, GIF, and WEBP images are allowed.');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Image must be under 5MB.');
      return;
    }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) return;

    let blob: ExternalBlob | null = null;
    if (imageFile) {
      const bytes = new Uint8Array(await imageFile.arrayBuffer());
      blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
    }

    createPost.mutate(
      { authorName, content: text.trim(), image: blob },
      {
        onSuccess: (result) => {
          if (result.__kind__ === 'ok') {
            setText('');
            handleRemoveImage();
            setUploadProgress(0);
            toast.success('Post created!');
          } else {
            toast.error(result.error);
          }
        },
        onError: (err) => {
          toast.error('Failed to create post: ' + err.message);
          setUploadProgress(0);
        },
      }
    );
  };

  return (
    <div className="bg-cosmic-surface border border-cosmic-border rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-cosmic-accent/30 flex items-center justify-center text-cosmic-accent font-bold text-sm shrink-0">
          {authorName.charAt(0).toUpperCase()}
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share something with the community..."
          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none min-h-[80px] focus:border-cosmic-accent/50"
          maxLength={2000}
        />
      </div>

      {imagePreview && (
        <div className="relative inline-block ml-12">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-48 rounded-lg object-cover border border-white/10"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {createPost.isPending && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="ml-12">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cosmic-accent transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-1">Uploading... {uploadProgress}%</p>
        </div>
      )}

      <div className="flex items-center justify-between ml-12">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-white/50 hover:text-cosmic-accent transition-colors text-sm px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <Image size={16} />
            <span>Image</span>
          </button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={createPost.isPending || (!text.trim() && !imageFile)}
          size="sm"
          className="bg-cosmic-accent hover:bg-cosmic-accent/80 text-white gap-1.5"
        >
          {createPost.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          Post
        </Button>
      </div>
    </div>
  );
}
