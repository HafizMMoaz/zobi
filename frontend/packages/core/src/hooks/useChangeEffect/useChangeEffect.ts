import { useEffect } from 'react';
import { usePrevious } from '../usePrevious';

/**
 * Calls the callback when the value changes.
 *
 * Passes the previous and current values to the callback
 */
export function useChangeEffect<T>(
  value: T,
  callback: (previous: T | undefined, current: T) => void,
) {
  const previous = usePrevious(value);
  useEffect(() => {
    if (value !== previous) {
      callback(previous, value);
    }
  }, [value, previous, callback]);
}
