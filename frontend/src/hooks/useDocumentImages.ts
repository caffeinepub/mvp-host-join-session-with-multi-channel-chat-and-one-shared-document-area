import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ImageReference, StandardResponse } from '../types/session';

// NOTE: Document image backend methods are not available in the current backend.
// These hooks return empty/null data gracefully.

export function useListDocumentImages(documentId: bigint | null) {
  return useQuery<ImageReference[]>({
    queryKey: ['documentImages', documentId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useAddImageToDocument() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, {
    sessionId: bigint;
    documentId: bigint;
    fileId: string;
    title: string;
    caption: string;
    position: bigint;
    size: bigint;
  }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentImages', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['sessionDocument', variables.documentId.toString()] });
    },
  });
}

export function useAddImageToPlayerDocument() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, {
    documentId: bigint;
    fileId: string;
    title: string;
    caption: string;
    position: bigint;
    size: bigint;
  }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentImages', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['playerDocument', variables.documentId.toString()] });
    },
  });
}
