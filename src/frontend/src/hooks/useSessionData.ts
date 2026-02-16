import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { usePolling } from './usePolling';
import { POLLING_INTERVALS } from '../config/polling';
import type { Session, Channel, MembersChannel, Message } from '../backend';

export function useSessionData(
  sessionId: bigint,
  selectedChannelId: bigint | null
) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

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

  // Members' Channels query
  const membersChannelsQuery = useQuery<MembersChannel[]>({
    queryKey: ['membersChannels', sessionId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMembersChannels(sessionId);
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

  return {
    session: sessionQuery.data,
    channels: channelsQuery.data,
    membersChannels: membersChannelsQuery.data,
    messages: messagesQuery.data,
    isLoading: sessionQuery.isLoading || channelsQuery.isLoading || membersChannelsQuery.isLoading,
    refetchSession: sessionQuery.refetch,
    refetchChannels: channelsQuery.refetch,
    refetchMembersChannels: membersChannelsQuery.refetch,
    refetchMessages: messagesQuery.refetch,
  };
}

// Members' Channel mutations
export function useCreateMembersChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, name }: { sessionId: bigint; name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMembersChannel(sessionId, name);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membersChannels', variables.sessionId.toString()] });
    },
  });
}

export function useRenameMembersChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, channelId, newName }: { sessionId: bigint; channelId: bigint; newName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.renameMembersChannel(sessionId, channelId, newName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membersChannels', variables.sessionId.toString()] });
    },
  });
}

export function useDeleteMembersChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, channelId }: { sessionId: bigint; channelId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMembersChannel(sessionId, channelId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membersChannels', variables.sessionId.toString()] });
    },
  });
}
