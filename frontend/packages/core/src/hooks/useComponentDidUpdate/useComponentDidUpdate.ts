import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

export const useComponentDidUpdate = (
  effect: EffectCallback,
  deps?: DependencyList,
) => {
  const isMountedRef = useRef(false);
  useEffect(() => {
    if (isMountedRef.current) {
      effect();
    } else {
      isMountedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || [effect])]);
};
