import { useLayoutEffect, useRef, useState } from 'react';

/**
 * This hook encapsulates logic to support truncation of child HTML
 * elements contained in a fixed-width parent HTML element.  Given
 * a ref to the parent element and optionally a ref to the "+x"
 * component that shows the number of truncated items, this hook
 * will return the number of elements that are not fully visible
 * (including those completely hidden) and whether any elements
 * are completely hidden.
 */
const useChildElementTruncation = () => {
  const [elementsTruncated, setElementsTruncated] = useState(0);
  const [hasHiddenElements, setHasHiddenElements] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const onResize = () => {
      const currentElement = elementRef.current;
      if (!currentElement) {
        return;
      }
      const plusRefElement = plusRef.current;
      const { scrollWidth, clientWidth, childNodes } = currentElement;

      if (scrollWidth > clientWidth) {
        // "..." is around 6px wide
        const truncationWidth = 6;
        const plusSize = plusRefElement?.offsetWidth || 0;
        const maxWidth = clientWidth - truncationWidth;
        const elementsCount = childNodes.length;

        let width = 0;
        let hiddenElements = 0;
        for (let i = 0; i < elementsCount; i += 1) {
          const itemWidth = (childNodes[i] as HTMLElement).offsetWidth;
          const remainingWidth = maxWidth - width - plusSize;

          // assures it shows +{number} only when the item is not visible
          if (remainingWidth <= 0) {
            hiddenElements += 1;
          }
          width += itemWidth;
        }

        if (elementsCount > 1 && hiddenElements) {
          setHasHiddenElements(true);
          setElementsTruncated(hiddenElements);
        } else {
          setHasHiddenElements(false);
          setElementsTruncated(1);
        }
      } else {
        setHasHiddenElements(false);
        setElementsTruncated(0);
      }
    };
    const obs = new ResizeObserver(onResize);

    const element = elementRef.current?.parentElement;
    if (element) {
      obs.observe(element);
    }

    onResize();

    return () => {
      obs.disconnect();
    };
  }, [plusRef.current]); // oxlint-disable-line react-hooks/exhaustive-deps plus is rendered dynamically - the component rerenders the hook when plus appears, this makes sure that useLayoutEffect is rerun

  return [elementRef, plusRef, elementsTruncated, hasHiddenElements] as const;
};

export default useChildElementTruncation;
