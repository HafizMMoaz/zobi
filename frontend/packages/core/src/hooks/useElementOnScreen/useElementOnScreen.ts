import { useEffect, useRef, useState, RefObject } from 'react';

export function useElementOnScreen<T extends Element>(
  options: IntersectionObserverInit,
): [RefObject<T>, boolean] {
  const containerRef = useRef<T>(null);
  const [isSticky, setIsSticky] = useState(false);

  const callback = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    setIsSticky(entry.intersectionRatio < 1);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(callback, options);
    const element = containerRef.current;
    if (element) {
      observer.observe(element);
    }
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [containerRef, options]);

  return [containerRef, isSticky];
}
