import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PlayerDocument, PlayerDocumentMetadata } from '../backend';

export function useListPlayerDocuments(sessionId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PlayerDocument[]>({
    queryKey: ['playerDocuments', sessionId?.toString()],
    queryFn: async () => {
      if (!actor || !sessionId) return [];
      return actor.listPlayerDocuments(sessionId);
    },
    enabled: !!actor && !actorFetching && !!sessionId,
    refetchInterval: 5000,
  });
}

export function useGetPlayerDocument(documentId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PlayerDocument | null>({
    queryKey: ['playerDocument', documentId?.toString()],
    queryFn: async () => {
      if (!actor || !documentId) return null;
      return actor.getPlayerDocument(documentId);
    },
    enabled: !!actor && !actorFetching && !!documentId,
    refetchInterval: 5000,
  });
}

export function useCreatePlayerDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      name,
      content,
      isPrivate,
    }: {
      sessionId: bigint;
      name: string;
      content: string;
      isPrivate: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPlayerDocument(sessionId, name, content, isPrivate);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playerDocuments', variables.sessionId.toString()] });
    },
  });
}

export function useRenamePlayerDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, newName }: { documentId: bigint; newName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.renamePlayerDocument(documentId, newName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playerDocument', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['playerDocuments'] });
    },
  });
}

export function useDeletePlayerDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePlayerDocument(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerDocuments'] });
    },
  });
}

export function useEditPlayerDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, newContent }: { documentId: bigint; newContent: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editPlayerDocument(documentId, newContent);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playerDocument', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['playerDocuments'] });
    },
  });
}

export function useSetPlayerDocumentVisibility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, isPrivate }: { documentId: bigint; isPrivate: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPlayerDocumentVisibility(documentId, isPrivate);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playerDocument', variables.documentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['playerDocuments'] });
    },
  });
}
