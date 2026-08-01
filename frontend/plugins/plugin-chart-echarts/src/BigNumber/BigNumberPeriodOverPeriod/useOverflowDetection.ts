import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';

export const useOverflowDetection = (flexGap: number) => {
  const symbolContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    let obs: ResizeObserver;
    const symbolContainerElem = symbolContainerRef.current;
    const wrapperElem = wrapperRef.current;
    if (symbolContainerElem && wrapperElem) {
      const symbolContainerChildrenElems = Array.from(
        symbolContainerElem.children,
      );
      obs = new ResizeObserver(
        debounce(() => {
          const totalChildrenWidth = symbolContainerChildrenElems.reduce(
            (acc, element) =>
              // take symbol container's child's scroll width to account for the container growing with display: flex
              acc + (element.firstElementChild?.scrollWidth ?? 0),
            0,
          );
          if (
            totalChildrenWidth +
              flexGap * Math.max(symbolContainerChildrenElems.length - 1, 0) >
            wrapperElem.clientWidth
          ) {
            setIsOverflowing(true);
          } else {
            setIsOverflowing(false);
          }
        }, 500),
      );
      obs.observe(document.body);
      symbolContainerChildrenElems.forEach(elem => {
        obs.observe(elem);
      });
    }
    return () => obs?.disconnect();
  }, [flexGap]);

  return { isOverflowing, symbolContainerRef, wrapperRef };
};
