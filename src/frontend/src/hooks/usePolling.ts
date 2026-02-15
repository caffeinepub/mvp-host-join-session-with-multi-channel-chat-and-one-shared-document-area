import { useEffect, useRef } from 'react';

export function usePolling(callback: () => void, interval: number, enabled: boolean = true) {
  const savedCallback = useRef(callback);

  // Update ref when callback changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up interval
  useEffect(() => {
    if (!enabled) return;

    const tick = () => savedCallback.current();
    const id = setInterval(tick, interval);

    return () => clearInterval(id);
  }, [interval, enabled]);
}
