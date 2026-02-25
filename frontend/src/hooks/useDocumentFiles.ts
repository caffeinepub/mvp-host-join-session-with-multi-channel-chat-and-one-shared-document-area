import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DocumentFileReference, UploadFileRequest, UploadDocumentFileResponse } from '../types/session';

// NOTE: Document file backend methods are not available in the current backend.
// These hooks return empty/null data gracefully.

export function useListDocumentFiles(documentId: bigint | null) {
  return useQuery<DocumentFileReference[]>({
    queryKey: ['documentFiles', documentId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetDocumentFileReference(fileId: bigint | null) {
  return useQuery<DocumentFileReference | null>({
    queryKey: ['documentFileReference', fileId?.toString()],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useUploadDocumentFile() {
  const queryClient = useQueryClient();
  return useMutation<UploadDocumentFileResponse, Error, UploadFileRequest>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['documentFiles', variables.documentId.toString()],
      });
    },
  });
}
