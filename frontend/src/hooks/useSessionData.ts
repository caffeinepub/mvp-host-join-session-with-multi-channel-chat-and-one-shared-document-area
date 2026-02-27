import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { POLLING_INTERVALS } from '../config/polling';
import type { Session, Channel, MembersChannel, Message } from '../types/session';

export function useSessionData(
  sessionId: bigint,
  selectedChannelId: bigint | null
) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const sessionQuery = useQuery<Session | null>({
    queryKey: ['session', sessionId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getSession(sessionId);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVALS.SESSION,
  });

  const channelsQuery = useQuery<Channel[]>({
    queryKey: ['channels', sessionId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getChannels(sessionId);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVALS.LISTS,
  });

  const membersChannelsQuery = useQuery<MembersChannel[]>({
    queryKey: ['membersChannels', sessionId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMembersChannels(sessionId);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVALS.LISTS,
  });

  const messagesQuery = useQuery<Message[]>({
    queryKey: ['messages', sessionId.toString(), selectedChannelId?.toString()],
    queryFn: async () => {
      if (!actor || !selectedChannelId) return [];
      return (actor as any).getMessages(sessionId, selectedChannelId);
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

export function useCreateMembersChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, name }: { sessionId: bigint; name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createMembersChannel(sessionId, name);
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
      return (actor as any).renameMembersChannel(sessionId, channelId, newName);
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
      return (actor as any).deleteMembersChannel(sessionId, channelId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membersChannels', variables.sessionId.toString()] });
    },
  });
}
