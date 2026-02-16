import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';

export function useUserDisplayName(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['userDisplayName', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return 'Unknown';
      
      try {
        const profile = await actor.getUserProfile(principal);
        if (profile && profile.name) {
          return profile.name;
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
      
      // Fallback to shortened principal
      const principalStr = principal.toString();
      return `${principalStr.slice(0, 5)}...${principalStr.slice(-3)}`;
    },
    enabled: !!actor && !actorFetching && !!principal,
    staleTime: 60000, // Cache for 1 minute
  });
}
