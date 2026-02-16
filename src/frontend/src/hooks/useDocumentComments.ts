import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DocumentComment } from '../backend';

export function useGetDocumentComments(documentId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DocumentComment[]>({
    queryKey: ['documentComments', documentId?.toString()],
    queryFn: async () => {
      if (!actor || !documentId) return [];
      return actor.getComments(documentId);
    },
    enabled: !!actor && !actorFetching && !!documentId,
    refetchInterval: 5000,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, text }: { documentId: bigint; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(documentId, text);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentComments', variables.documentId.toString()] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, documentId }: { commentId: bigint; documentId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteComment(commentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentComments', variables.documentId.toString()] });
    },
  });
}

export function useUpdateComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, documentId, text }: { commentId: bigint; documentId: bigint; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateComment(commentId, text);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentComments', variables.documentId.toString()] });
    },
  });
}
