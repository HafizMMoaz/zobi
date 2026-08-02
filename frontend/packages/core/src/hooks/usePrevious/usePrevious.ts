import { useEffect, useRef } from 'react';

/**
 * Pass in a piece of state.
 * This hook returns what the value of that state was in the previous render.
 * Returns undefined (or whatever value you specify) the first time.
 */
export function usePrevious<T>(value: T): T | undefined;
export function usePrevious<T, INIT>(value: T, initialValue: INIT): T | INIT;
export function usePrevious<T>(value: T, initialValue?: any): T {
  const previous = useRef<T>(initialValue);
  useEffect(() => {
    // useEffect runs after the render completes
    previous.current = value;
  }, [value]);
  return previous.current;
}
