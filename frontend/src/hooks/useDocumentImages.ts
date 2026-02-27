import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ImageReference } from '../types/session';

export function useListDocumentImages(documentId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ImageReference[]>({
    queryKey: ['documentImages', documentId?.toString()],
    queryFn: async () => {
      if (!actor || !documentId) return [];
      return (actor as any).getImageReferences(documentId);
    },
    enabled: !!actor && !actorFetching && !!documentId,
  });
}

export function useAddImageToDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      documentId,
      fileId,
      title,
      caption,
      position,
      size,
    }: {
      sessionId: bigint;
      documentId: bigint;
      fileId: string;
      title: string;
      caption: string;
      position: bigint;
      size: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addImageToDocument(sessionId, documentId, fileId, title, caption, position, size);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentImages', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['sessionDocument', variables.documentId.toString()] });
    },
  });
}

export function useAddImageToPlayerDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      fileId,
      title,
      caption,
      position,
      size,
    }: {
      documentId: bigint;
      fileId: string;
      title: string;
      caption: string;
      position: bigint;
      size: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addImageToPlayerDocument(documentId, fileId, title, caption, position, size);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentImages', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['playerDocument', variables.documentId.toString()] });
    },
  });
}
