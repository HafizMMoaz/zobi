import { useState, useEffect } from 'react';
import { Constants } from '@zobi-ui/core/components';

export function useDebounceValue<T>(value: T, delay = Constants.FAST_DEBOUNCE) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler: NodeJS.Timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
