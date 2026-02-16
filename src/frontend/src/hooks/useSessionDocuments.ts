import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Document } from '../backend';

export function useListSessionDocuments(sessionId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Document[]>({
    queryKey: ['sessionDocuments', sessionId?.toString()],
    queryFn: async () => {
      if (!actor || !sessionId) return [];
      return actor.listDocuments(sessionId);
    },
    enabled: !!actor && !actorFetching && !!sessionId,
    refetchInterval: 5000,
  });
}

export function useGetSessionDocument(documentId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Document | null>({
    queryKey: ['sessionDocument', documentId?.toString()],
    queryFn: async () => {
      if (!actor || !documentId) return null;
      return actor.getDocument(documentId);
    },
    enabled: !!actor && !actorFetching && !!documentId,
    refetchInterval: 5000,
  });
}

export function useCreateSessionDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      name,
      content,
    }: {
      sessionId: bigint;
      name: string;
      content: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDocument(sessionId, name, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessionDocuments', variables.sessionId.toString()] });
    },
  });
}

export function useRenameSessionDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, newName }: { documentId: bigint; newName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.renameDocument(documentId, newName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessionDocument', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['sessionDocuments'] });
    },
  });
}

export function useDeleteSessionDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteDocument(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionDocuments'] });
    },
  });
}

export function useEditSessionDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, newContent }: { documentId: bigint; newContent: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editDocument(documentId, newContent);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessionDocument', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['sessionDocuments'] });
    },
  });
}
