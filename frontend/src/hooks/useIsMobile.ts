import { useState, useEffect } from 'react';

/**
 * Hook to detect if the viewport is mobile-sized (< 1024px)
 * Includes phones and tablets like iPad Mini
 * Updates on window resize
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
