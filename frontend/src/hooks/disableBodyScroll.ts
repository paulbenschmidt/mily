import { useEffect } from 'react';

/**
 * Disables body scrolling when a modal is open
 * Restores original overflow style when modal closes
 */
export function disableBodyScroll(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // Save the current overflow value
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Disable scrolling on body
      document.body.style.overflow = 'hidden';

      // Re-enable scrolling when component unmounts or modal closes
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);
}
