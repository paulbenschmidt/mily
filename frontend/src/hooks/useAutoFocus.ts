import { useEffect, useRef } from 'react';

/**
 * Auto-focuses an element when a condition is met
 * @param shouldFocus - Condition that determines when to focus
 * @returns Ref to attach to the element
 */
export function useAutoFocus<T extends HTMLElement>(shouldFocus: boolean) {
  const ref = useRef<T>(null);
  
  useEffect(() => {
    if (shouldFocus) {
      ref.current?.focus();
    }
  }, [shouldFocus]);
  
  return ref;
}
