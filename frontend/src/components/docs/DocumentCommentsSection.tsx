import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetDocumentComments, useAddComment, useDeleteComment } from '../../hooks/useDocumentComments';
import { useUserDisplayName } from '../../hooks/useUserDisplayName';
import type { DocumentComment } from '../../types/session';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { MessageSquare, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { formatTimestamp } from '../../lib/time';
import type { Principal } from '@icp-sdk/core/principal';

type DocumentCommentsSectionProps = {
  documentId: bigint;
  isHost?: boolean;
};

function CommentItem({
  comment,
  canDelete,
  onDelete,
}: {
  comment: DocumentComment;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const { data: displayName } = useUserDisplayName(comment.author as Principal);

  return (
    <div className="flex gap-3 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">{displayName || 'Unknown'}</span>
          <span className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</span>
        </div>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">{comment.text}</p>
      </div>
      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="shrink-0 text-destructive hover:text-destructive min-h-[32px] min-w-[32px] p-1"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function DocumentCommentsSection({ documentId, isHost = false }: DocumentCommentsSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: comments = [], isLoading } = useGetDocumentComments(documentId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const [newComment, setNewComment] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [addError, setAddError] = useState('');

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setAddError('');
    try {
      const result = await addComment.mutateAsync({ documentId, text: newComment.trim() });
      if (result.__kind__ === 'error') {
        setAddError(result.error);
      } else {
        setNewComment('');
      }
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteTarget) return;
    try {
      await deleteComment.mutateAsync({ commentId: deleteTarget, documentId });
      setDeleteTarget(null);
    } catch (err: unknown) {
      console.error('Failed to delete comment:', err);
    }
  };

  const canDeleteComment = (comment: DocumentComment) => {
    if (isHost) return true;
    return identity?.getPrincipal().toString() === comment.author.toString();
  };

  return (
    <div className="border-t border-border pt-4 mt-4">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4" />
        Comments ({comments.length})
      </h3>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading comments...
        </div>
      ) : comments.length > 0 ? (
        <ScrollArea className="max-h-64 mb-4">
          <div className="divide-y divide-border">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id.toString()}
                comment={comment}
                canDelete={canDeleteComment(comment)}
                onDelete={() => setDeleteTarget(comment.id)}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">No comments yet.</p>
      )}

      <div className="space-y-2">
        {addError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{addError}</AlertDescription>
          </Alert>
        )}
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[80px] resize-none text-sm"
          disabled={addComment.isPending}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={addComment.isPending || !newComment.trim()}
          >
            {addComment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Comment'
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} disabled={deleteComment.isPending}>
              {deleteComment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
