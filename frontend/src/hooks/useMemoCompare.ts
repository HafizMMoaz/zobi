import { useEffect, useRef } from 'react';
import { isDefined } from '@zobi.dev/core';

export const useMemoCompare = <T>(
  next: T,
  compare: (prev: T | undefined, next: T) => boolean,
) => {
  const previousRef = useRef<T>();
  const previous = previousRef.current;
  const isEqual = compare(previous, next);
  useEffect(() => {
    if (!isEqual) {
      previousRef.current = next;
    }
  });
  if (!isDefined(previous)) {
    return next;
  }
  return isEqual ? previous : next;
};
