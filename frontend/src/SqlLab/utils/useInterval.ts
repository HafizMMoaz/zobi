import { useEffect, useRef } from 'react';

/*
 * Functional components and setTimeout with useState do not play well
 * and the setTimeout callback typically has stale state from a closure
 * The useInterval function solves this issue.
 * more info: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
function useInterval(callback: Function, delay: number | null): void {
  const savedCallback = useRef<Function>(callback);
  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback?.current?.();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
    return () => {};
  }, [delay]);
}

export default useInterval;
