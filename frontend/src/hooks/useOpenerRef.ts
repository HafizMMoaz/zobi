
import { useEffect, useRef } from 'react';

export function useOpenerRef(active: boolean) {
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active) {
      openerRef.current = document.activeElement as HTMLElement;
    }
  }, [active]);

  return openerRef;
}
