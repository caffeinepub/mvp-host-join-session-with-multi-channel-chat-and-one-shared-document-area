import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { usePolling } from './usePolling';
import { POLLING_INTERVALS } from '../config/polling';
import type { Session, Channel, MembersChannel, Message, StandardResponse } from '../types/session';

// NOTE: Session/RPG backend methods are not available in the current backend.
// These hooks return empty/null data gracefully.

export function useSessionData(
  sessionId: bigint,
  selectedChannelId: bigint | null
) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const sessionQuery = useQuery<Session | null>({
    queryKey: ['session', sessionId.toString()],
    queryFn: async () => null,
    enabled: false,
  });

  const channelsQuery = useQuery<Channel[]>({
    queryKey: ['channels', sessionId.toString()],
    queryFn: async () => [],
    enabled: false,
  });

  const membersChannelsQuery = useQuery<MembersChannel[]>({
    queryKey: ['membersChannels', sessionId.toString()],
    queryFn: async () => [],
    enabled: false,
  });

  const messagesQuery = useQuery<Message[]>({
    queryKey: ['messages', sessionId.toString(), selectedChannelId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });

  return {
    session: sessionQuery.data ?? null,
    channels: channelsQuery.data ?? [],
    membersChannels: membersChannelsQuery.data ?? [],
    messages: messagesQuery.data ?? [],
    isLoading: false,
    refetchSession: sessionQuery.refetch,
    refetchChannels: channelsQuery.refetch,
    refetchMembersChannels: membersChannelsQuery.refetch,
    refetchMessages: messagesQuery.refetch,
  };
}

export function useCreateMembersChannel() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, { sessionId: bigint; name: string }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membersChannels', variables.sessionId.toString()] });
    },
  });
}

export function useRenameMembersChannel() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, { sessionId: bigint; channelId: bigint; newName: string }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membersChannels', variables.sessionId.toString()] });
    },
  });
}

export function useDeleteMembersChannel() {
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, { sessionId: bigint; channelId: bigint }>({
    mutationFn: async () => ({ __kind__: 'error' as const, error: 'Not available' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membersChannels', variables.sessionId.toString()] });
    },
  });
}
