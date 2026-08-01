
import { useCallback, useRef } from 'react';

export interface HeightCache {
  /** Get the cached height for an item, or undefined if not cached */
  getHeight: (id: string) => number | undefined;
  /** Set the cached height for an item */
  setHeight: (id: string, height: number) => void;
  /** Check if a height is cached for an item */
  hasHeight: (id: string) => boolean;
  /** Clear all cached heights */
  clearCache: () => void;
  /** Get the current version number (increments on cache changes) */
  getVersion: () => number;
}

/**
 * Hook that provides a cache for dynamically measured item heights.
 * Used for items like EmptyState folders where height cannot be pre-calculated.
 *
 * The cache uses a ref to avoid re-renders when heights are updated.
 * Call getVersion() to get a version number that changes when cache updates,
 * which can be used to trigger re-renders when needed.
 */
export function useHeightCache(): HeightCache {
  const cacheRef = useRef<Map<string, number>>(new Map());
  const versionRef = useRef(0);

  const getHeight = useCallback(
    (id: string): number | undefined => cacheRef.current.get(id),
    [],
  );

  const setHeight = useCallback((id: string, height: number): void => {
    const currentHeight = cacheRef.current.get(id);
    if (currentHeight !== height) {
      cacheRef.current.set(id, height);
      versionRef.current += 1;
    }
  }, []);

  const hasHeight = useCallback(
    (id: string): boolean => cacheRef.current.has(id),
    [],
  );

  const clearCache = useCallback((): void => {
    if (cacheRef.current.size > 0) {
      cacheRef.current.clear();
      versionRef.current += 1;
    }
  }, []);

  const getVersion = useCallback((): number => versionRef.current, []);

  return {
    getHeight,
    setHeight,
    hasHeight,
    clearCache,
    getVersion,
  };
}
