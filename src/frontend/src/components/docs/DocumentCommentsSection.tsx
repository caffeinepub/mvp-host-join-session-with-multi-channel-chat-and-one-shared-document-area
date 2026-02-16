import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetDocumentComments, useAddComment, useDeleteComment } from '../../hooks/useDocumentComments';
import { useUserDisplayName } from '../../hooks/useUserDisplayName';
import type { DocumentComment } from '../../backend';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { MessageSquare, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { formatTimestamp } from '../../lib/time';

type DocumentCommentsSectionProps = {
  documentId: bigint;
  isHost?: boolean;
};

function CommentItem({ comment, canDelete, onDelete }: { comment: DocumentComment; canDelete: boolean; onDelete: () => void }) {
  const { data: displayName } = useUserDisplayName(comment.author);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div className="space-y-2 p-3 rounded-lg bg-muted/50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(comment.timestamp)}
              </span>
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.text}</p>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function DocumentCommentsSection({ documentId, isHost = false }: DocumentCommentsSectionProps) {
  const { identity } = useInternetIdentity();
  const [newCommentText, setNewCommentText] = useState('');
  const [error, setError] = useState('');

  const { data: comments = [], isLoading, error: loadError } = useGetDocumentComments(documentId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;

    setError('');
    try {
      await addComment.mutateAsync({
        documentId,
        text: newCommentText.trim(),
      });
      setNewCommentText('');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(err.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: bigint) => {
    setError('');
    try {
      await deleteComment.mutateAsync({ commentId, documentId });
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.message || 'Failed to delete comment');
    }
  };

  const currentPrincipal = identity?.getPrincipal().toString();

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Comments ({comments.length})
      </h3>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loadError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load comments</AlertDescription>
        </Alert>
      )}

      {/* Comment Input */}
      <div className="space-y-2">
        <Textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="resize-none"
          rows={3}
          disabled={addComment.isPending}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleAddComment}
            disabled={!newCommentText.trim() || addComment.isPending}
            size="sm"
          >
            {addComment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Comment'
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-3 pr-4">
            {comments.map((comment) => {
              const isAuthor = currentPrincipal === comment.author.toString();
              const canDelete = isAuthor || isHost;

              return (
                <CommentItem
                  key={comment.id.toString()}
                  comment={comment}
                  canDelete={canDelete}
                  onDelete={() => handleDeleteComment(comment.id)}
                />
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
