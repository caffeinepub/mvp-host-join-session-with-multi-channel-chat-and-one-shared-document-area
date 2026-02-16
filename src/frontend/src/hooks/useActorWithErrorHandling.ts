import { useActor } from './useActor';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const ACTOR_CREATION_TIMEOUT = 30000; // 30 seconds

export function useActorWithErrorHandling() {
    const { actor, isFetching } = useActor();
    const queryClient = useQueryClient();
    const [error, setError] = useState<Error | null>(null);
    const [isError, setIsError] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasStartedRef = useRef(false);

    // Set up timeout detection - only start once when fetching begins
    useEffect(() => {
        // If we have an actor, clear any errors and timeout
        if (actor) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setError(null);
            setIsError(false);
            hasStartedRef.current = false;
            return;
        }

        // Start timeout only once when fetching begins
        if (isFetching && !hasStartedRef.current && !timeoutRef.current) {
            hasStartedRef.current = true;
            
            timeoutRef.current = setTimeout(() => {
                setError(new Error('Actor initialization timed out after 30 seconds. The backend may be unavailable or taking too long to respond.'));
                setIsError(true);
                timeoutRef.current = null;
            }, ACTOR_CREATION_TIMEOUT);
        }

        // Cleanup on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [actor, isFetching]);

    const refetch = useCallback(() => {
        // Clear error state
        setError(null);
        setIsError(false);
        hasStartedRef.current = false;
        
        // Clear timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Invalidate and refetch the actor query
        queryClient.invalidateQueries({ queryKey: ['actor'] });
        queryClient.refetchQueries({ queryKey: ['actor'] });
    }, [queryClient]);

    return {
        actor,
        isFetching,
        error,
        isError,
        refetch,
    };
}
