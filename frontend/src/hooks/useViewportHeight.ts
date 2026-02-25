import { useState, useEffect } from 'react';

/**
 * Custom hook that tracks dynamic viewport height changes.
 * Useful for handling mobile keyboard appearance, screen rotation, and other viewport changes.
 * Returns the current viewport height in pixels.
 */
export function useViewportHeight(): number {
  const [height, setHeight] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.visualViewport?.height || window.innerHeight;
    }
    return 0;
  });

  useEffect(() => {
    const updateHeight = () => {
      const newHeight = window.visualViewport?.height || window.innerHeight;
      setHeight(newHeight);
    };

    // Listen to multiple events that can change viewport height
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    
    // Visual viewport is more accurate for mobile keyboard
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeight);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateHeight);
      }
    };
  }, []);

  return height;
}
