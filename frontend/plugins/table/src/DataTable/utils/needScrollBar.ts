/**
 * Whether a container need scroll bars when in another container.
 */
export default function needScrollBar({
  width,
  height,
  innerHeight,
  innerWidth,
  scrollBarSize,
}: {
  width: number;
  height: number;
  innerHeight: number;
  scrollBarSize: number;
  innerWidth: number;
}): [boolean, boolean] {
  const hasVerticalScroll = innerHeight > height;
  const hasHorizontalScroll =
    innerWidth > width - (hasVerticalScroll ? scrollBarSize : 0);
  return [hasVerticalScroll, hasHorizontalScroll];
}
