import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Tab, TabData, Community, CommunityPost, StandardResponse } from '../backend';
import { ExternalBlob } from '../backend';

// ─── Community Queries ────────────────────────────────────────────────────────

export function useGetCommunity(communityId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Community | null>({
    queryKey: ['community', communityId?.toString()],
    queryFn: async () => {
      if (!actor || communityId === null) return null;
      return actor.getCommunity(communityId);
    },
    enabled: !!actor && !isFetching && communityId !== null,
  });
}

export function useGetTabs(communityId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<TabData[]>({
    queryKey: ['tabs', communityId?.toString()],
    queryFn: async () => {
      if (!actor || communityId === null) return [];
      return actor.getTabs(communityId);
    },
    enabled: !!actor && !isFetching && communityId !== null,
  });
}

export function useCanReorder(communityId: bigint | null, principal: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['canReorder', communityId?.toString(), principal],
    queryFn: async () => {
      if (!actor || communityId === null || !principal) return false;
      const { Principal } = await import('@dfinity/principal');
      return actor.canReorder(communityId, Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && communityId !== null && !!principal,
  });
}

export function useReorderTabs(communityId: bigint) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<StandardResponse, Error, Tab[]>({
    mutationFn: async (newTabOrder: Tab[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reorderTabs(communityId, newTabOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabs', communityId.toString()] });
    },
  });
}

export function useGetCommunityPosts(communityId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<CommunityPost[]>({
    queryKey: ['communityPosts', communityId?.toString()],
    queryFn: async () => {
      if (!actor || communityId === null) return [];
      return actor.getCommunityPosts(communityId);
    },
    enabled: !!actor && !isFetching && communityId !== null,
    refetchInterval: 10000,
  });
}

export function useCreateCommunityPost(communityId: bigint) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    StandardResponse,
    Error,
    { authorName: string; content: string; image: ExternalBlob | null }
  >({
    mutationFn: async ({ authorName, content, image }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCommunityPost(communityId, authorName, content, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts', communityId.toString()] });
    },
  });
}

export function useUpdateCommunitySettings(communityId: bigint) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    StandardResponse,
    Error,
    {
      bannerImage: ExternalBlob | null;
      primaryColor: string | null;
      accentColor: string | null;
      font: string | null;
      layoutOptions: string | null;
    }
  >({
    mutationFn: async ({ bannerImage, primaryColor, accentColor, font, layoutOptions }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCommunitySettings(
        communityId,
        bannerImage,
        primaryColor,
        accentColor,
        font,
        layoutOptions
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId.toString()] });
    },
  });
}

export function useGetMemberTabReorderPermissions(communityId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[import('@dfinity/principal').Principal, boolean]>>({
    queryKey: ['memberTabReorderPermissions', communityId?.toString()],
    queryFn: async () => {
      if (!actor || communityId === null) return [];
      return actor.getMemberTabReorderPermissions(communityId) as Promise<Array<[import('@dfinity/principal').Principal, boolean]>>;
    },
    enabled: !!actor && !isFetching && communityId !== null,
  });
}

export function useUpdateMemberTabReorderPermission(communityId: bigint) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    StandardResponse,
    Error,
    { member: import('@dfinity/principal').Principal; canReorderTabs: boolean }
  >({
    mutationFn: async ({ member, canReorderTabs }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMemberTabReorderPermission(communityId, member, canReorderTabs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['memberTabReorderPermissions', communityId.toString()],
      });
    },
  });
}
