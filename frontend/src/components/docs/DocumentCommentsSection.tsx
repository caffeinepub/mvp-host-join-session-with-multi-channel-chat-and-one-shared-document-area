import { useState } from 'react';
import { useGetDocumentComments, useAddComment, useDeleteComment } from '../../hooks/useDocumentComments';
import type { DocumentComment } from '../../types/session';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Trash2, MessageSquare } from 'lucide-react';
import { formatTimestamp } from '../../lib/time';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useUserDisplayName } from '../../hooks/useUserDisplayName';

type CommentItemProps = {
  comment: DocumentComment;
  isHost: boolean;
  onDelete: (commentId: bigint) => void;
  isDeleting: boolean;
};

function CommentItem({ comment, isHost, onDelete, isDeleting }: CommentItemProps) {
  const { identity } = useInternetIdentity();
  const { data: authorName } = useUserDisplayName(comment.author);
  const isOwner = identity?.getPrincipal().toString() === comment.author.toString();
  const canDelete = isHost || isOwner;

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">{authorName || 'Loading...'}</span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(comment.timestamp)}
          </span>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap">{comment.text}</p>
      </div>
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(comment.id)}
          disabled={isDeleting}
          className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          {isDeleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
}

type DocumentCommentsSectionProps = {
  documentId: bigint;
  isHost: boolean;
};

export default function DocumentCommentsSection({ documentId, isHost }: DocumentCommentsSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: comments = [], isLoading } = useGetDocumentComments(documentId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [newComment, setNewComment] = useState('');
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const handleAddComment = async () => {
    if (!newComment.trim() || !identity) return;

    try {
      await addComment.mutateAsync({ documentId, text: newComment.trim() });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: bigint) => {
    setDeletingId(commentId);
    try {
      await deleteComment.mutateAsync({ commentId, documentId });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Comments</h3>
        <span className="text-xs text-muted-foreground">({comments.length})</span>
      </div>

      {identity && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            className="resize-none"
            disabled={addComment.isPending}
          />
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim() || addComment.isPending}
          >
            {addComment.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Add Comment
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
      ) : (
        <ScrollArea className="max-h-64">
          <div className="pr-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id.toString()}
                comment={comment}
                isHost={isHost}
                onDelete={handleDeleteComment}
                isDeleting={deletingId === comment.id}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
