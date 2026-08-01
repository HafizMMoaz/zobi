import { useLayoutEffect, useRef, useMemo } from 'react';

/**
 * Execute a memoized callback only when mounted. Execute again when factory updated.
 * Returns undefined if not mounted yet.
 */
export default function useMountedMemo<T>(
  factory: () => T,
  deps?: unknown[],
): T | undefined {
  const mounted = useRef<typeof factory>();
  useLayoutEffect(() => {
    mounted.current = factory;
  });
  return useMemo(() => {
    if (mounted.current) {
      return factory();
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted.current, mounted.current === factory, ...(deps || [])]);
}
