import { css } from '@emotion/react';
import { useEffect, useRef, useState, RefObject } from 'react';

/**
 * Importable CSS that enables text truncation on fixed-width block
 * elements.
 */
export const truncationCSS = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * This hook encapsulates logic supporting truncation of text via
 * the CSS "text-overflow: ellipsis;" feature.  Given the text content
 * to be displayed, this hook returns a ref to attach to the text
 * element and a boolean for whether that element is currently truncated.
 */
const useCSSTextTruncation = <T extends HTMLElement>(
  { isVertical, isHorizontal } = { isVertical: false, isHorizontal: true },
): [RefObject<T>, boolean] => {
  const [isTruncated, setIsTruncated] = useState(true);
  const ref = useRef<T>(null);
  const [offsetWidth, setOffsetWidth] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [offsetHeight, setOffsetHeight] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setOffsetWidth(ref.current?.offsetWidth ?? 0);
    setScrollWidth(ref.current?.scrollWidth ?? 0);
    setOffsetHeight(ref.current?.offsetHeight ?? 0);
    setScrollHeight(ref.current?.scrollHeight ?? 0);
  });

  useEffect(() => {
    setIsTruncated(
      (isVertical && offsetHeight < scrollHeight) ||
        (isHorizontal && offsetWidth < scrollWidth),
    );
  }, [
    offsetWidth,
    scrollWidth,
    offsetHeight,
    scrollHeight,
    isVertical,
    isHorizontal,
  ]);

  return [ref, isTruncated];
};

export default useCSSTextTruncation;
