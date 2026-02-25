import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Document, StandardResponse, CreateDocumentResponse } from '../types/session';

// NOTE: Session document backend methods are not available in the current backend.
// These hooks return empty/null data gracefully.

export function useListSessionDocuments(sessionId: bigint | null) {
  return useQuery<Document[]>({
    queryKey: ['sessionDocuments', sessionId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetSessionDocument(documentId: bigint | null) {
  return useQuery<Document | null>({
    queryKey: ['sessionDocument', documentId?.toString()],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useCreateSessionDocument() {
  const queryClient = useQueryClient();
  return useMutation<CreateDocumentResponse, Error, { sessionId: bigint; name: string; content: string }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessionDocuments', variables.sessionId.toString()] });
    },
  });
}

export function useRenameSessionDocument() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, { documentId: bigint; newName: string }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessionDocument', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['sessionDocuments'] });
    },
  });
}

export function useDeleteSessionDocument() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, bigint>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionDocuments'] });
    },
  });
}

export function useEditSessionDocument() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, { documentId: bigint; newContent: string }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessionDocument', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['sessionDocuments'] });
    },
  });
}
