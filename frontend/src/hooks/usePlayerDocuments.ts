import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PlayerDocument, PlayerDocumentMetadata, StandardResponse, CreateDocumentResponse } from '../types/session';

// NOTE: Player document backend methods are not available in the current backend.
// These hooks return empty/null data gracefully.

export function useListPlayerDocuments(sessionId: bigint | null) {
  return useQuery<PlayerDocument[]>({
    queryKey: ['playerDocuments', sessionId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetPlayerDocument(documentId: bigint | null) {
  return useQuery<PlayerDocument | null>({
    queryKey: ['playerDocument', documentId?.toString()],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useCreatePlayerDocument() {
  const queryClient = useQueryClient();
  return useMutation<CreateDocumentResponse, Error, { sessionId: bigint; name: string; content: string; isPrivate: boolean }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playerDocuments', variables.sessionId.toString()] });
    },
  });
}

export function useRenamePlayerDocument() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, { documentId: bigint; newName: string }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playerDocument', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['playerDocuments'] });
    },
  });
}

export function useDeletePlayerDocument() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, bigint>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerDocuments'] });
    },
  });
}

export function useEditPlayerDocument() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, { documentId: bigint; newContent: string }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playerDocument', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['playerDocuments'] });
    },
  });
}

export function useSetPlayerDocumentVisibility() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, { documentId: bigint; isPrivate: boolean }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playerDocument', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['playerDocuments'] });
    },
  });
}
