import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DocumentFileReference, UploadFileRequest } from '../backend';
import { ExternalBlob } from '../backend';

export function useListDocumentFiles(documentId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DocumentFileReference[]>({
    queryKey: ['documentFiles', documentId?.toString()],
    queryFn: async () => {
      if (!actor || !documentId) return [];
      return actor.listDocumentFiles(documentId);
    },
    enabled: !!actor && !actorFetching && !!documentId,
  });
}

export function useGetDocumentFileReference(fileId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DocumentFileReference | null>({
    queryKey: ['documentFileReference', fileId?.toString()],
    queryFn: async () => {
      if (!actor || !fileId) return null;
      return actor.getDocumentFileReference(fileId);
    },
    enabled: !!actor && !actorFetching && !!fileId,
  });
}

export function useUploadDocumentFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UploadFileRequest) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.uploadDocumentFile(request);
      return result;
    },
    onSuccess: (result, variables) => {
      // Invalidate the document files list to refresh the UI
      queryClient.invalidateQueries({
        queryKey: ['documentFiles', variables.documentId.toString()],
      });
    },
  });
}
