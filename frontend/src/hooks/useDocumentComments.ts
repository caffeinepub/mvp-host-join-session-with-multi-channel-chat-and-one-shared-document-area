import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DocumentComment, StandardResponse } from '../types/session';

// NOTE: Document comment backend methods are not available in the current backend.
// These hooks return empty/null data gracefully.

export function useGetDocumentComments(documentId: bigint | null) {
  return useQuery<DocumentComment[]>({
    queryKey: ['documentComments', documentId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, { documentId: bigint; text: string }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentComments', variables.documentId.toString()] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, { commentId: bigint; documentId: bigint }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentComments', variables.documentId.toString()] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, { commentId: bigint; documentId: bigint; text: string }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentComments', variables.documentId.toString()] });
    },
  });
}
