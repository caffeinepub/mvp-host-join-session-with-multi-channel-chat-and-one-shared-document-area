import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { usePolling } from './usePolling';
import { POLLING_INTERVALS } from '../config/polling';
import type { Session, Channel, Document, Message } from '../backend';

export function useSessionData(
  sessionId: bigint,
  selectedChannelId: bigint | null,
  selectedDocumentId: bigint | null
) {
  const { actor, isFetching: actorFetching } = useActor();

  // Session query
  const sessionQuery = useQuery<Session | null>({
    queryKey: ['session', sessionId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSession(sessionId);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVALS.SESSION,
  });

  // Channels query
  const channelsQuery = useQuery<Channel[]>({
    queryKey: ['channels', sessionId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChannels(sessionId);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVALS.LISTS,
  });

  // Documents query
  const documentsQuery = useQuery<Document[]>({
    queryKey: ['documents', sessionId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDocuments(sessionId);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVALS.LISTS,
  });

  // Messages query (for selected channel)
  const messagesQuery = useQuery<Message[]>({
    queryKey: ['messages', sessionId.toString(), selectedChannelId?.toString()],
    queryFn: async () => {
      if (!actor || !selectedChannelId) return [];
      return actor.getMessages(sessionId, selectedChannelId);
    },
    enabled: !!actor && !actorFetching && !!selectedChannelId,
    refetchInterval: POLLING_INTERVALS.MESSAGES,
  });

  // Current document query (for selected document)
  const documentQuery = useQuery<Document | null>({
    queryKey: ['document', selectedDocumentId?.toString()],
    queryFn: async () => {
      if (!actor || !selectedDocumentId) return null;
      return actor.getDocument(selectedDocumentId);
    },
    enabled: !!actor && !actorFetching && !!selectedDocumentId,
    refetchInterval: POLLING_INTERVALS.DOCUMENT_CONTENT,
  });

  return {
    session: sessionQuery.data,
    channels: channelsQuery.data,
    documents: documentsQuery.data,
    messages: messagesQuery.data,
    currentDocument: documentQuery.data,
    isLoading:
      sessionQuery.isLoading ||
      channelsQuery.isLoading ||
      documentsQuery.isLoading,
    refetchSession: sessionQuery.refetch,
    refetchChannels: channelsQuery.refetch,
    refetchDocuments: documentsQuery.refetch,
    refetchMessages: messagesQuery.refetch,
    refetchDocument: documentQuery.refetch,
  };
}
