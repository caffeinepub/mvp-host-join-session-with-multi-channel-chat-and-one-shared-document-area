import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';

const STARTUP_TIMEOUT_MS = 15000; // 15 seconds

interface StartupGuardState {
  startupFailed: boolean;
  reason?: string;
}

export function useActorStartupGuard(): StartupGuardState {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [startupFailed, setStartupFailed] = useState(false);
  const [reason, setReason] = useState<string | undefined>();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      // Reset failure state when not authenticated
      setStartupFailed(false);
      setReason(undefined);
      return;
    }

    // Monitor the actor query state
    const actorQueryKey = ['actor', identity.getPrincipal().toString()];
    const actorQuery = queryClient.getQueryState(actorQueryKey);

    // Check if the query has errored
    if (actorQuery?.status === 'error') {
      setStartupFailed(true);
      setReason(
        actorQuery.error instanceof Error
          ? actorQuery.error.message
          : 'Failed to initialize backend connection'
      );
      return;
    }

    // Set up a timeout to detect hung initialization
    const timeoutId = setTimeout(() => {
      const currentQuery = queryClient.getQueryState(actorQueryKey);
      
      // If still fetching after timeout, consider it failed
      if (currentQuery?.fetchStatus === 'fetching') {
        setStartupFailed(true);
        setReason('Initialization timeout: The backend service is taking too long to respond');
      }
    }, STARTUP_TIMEOUT_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, identity, queryClient]);

  return { startupFailed, reason };
}
