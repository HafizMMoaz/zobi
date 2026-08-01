import { useRef, useState } from 'react';
import { useAsyncDebounce } from 'react-table';

// useAsyncDebounce in dist build of `react-table` requires regeneratorRuntime
import 'regenerator-runtime/runtime';

/**
 * Hook useState to allow always return latest initialValue
 */
export default function useAsyncState<T, F extends (newValue: T) => unknown>(
  initialValue: T,
  callback: F,
  wait = 200,
) {
  const [value, setValue] = useState(initialValue);
  const valueRef = useRef(initialValue);
  const onChange = useAsyncDebounce(callback, wait);

  // sync updated initialValue
  if (valueRef.current !== initialValue) {
    valueRef.current = initialValue;
    if (value !== initialValue) {
      setValue(initialValue);
    }
  }

  const setBoth = (newValue: T) => {
    setValue(newValue);
    onChange(newValue);
  };

  return [value, setBoth] as [typeof value, typeof setValue];
}
