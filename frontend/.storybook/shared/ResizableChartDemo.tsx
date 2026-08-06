import { ReactNode, useEffect, useRef, useState } from 'react';
import type { Decorator } from '@storybook/react';
import { useTheme } from '@zobi.dev/extension-api/theme';

export interface ChartSize {
  width: number;
  height: number;
}

export interface ResizableChartDemoProps {
  /** Render prop called with the current inner size of the drag handle box. */
  children: (size: ChartSize) => ReactNode;
  initialSize?: ChartSize;
}

const DEFAULT_SIZE: ChartSize = { width: 500, height: 300 };

/**
 * Drag-resizable container that reports its size to the chart inside it.
 *
 * Chart plugins take explicit pixel `width`/`height` rather than filling their
 * parent, so the only way to exercise their responsive behaviour is to feed
 * them changing numbers. Resizing is delegated to the native CSS `resize`
 * handle and observed with `ResizeObserver`, which avoids pulling a drag
 * library (and its stylesheet) into the Storybook build.
 */
export function ResizableChartDemo({
  children,
  initialSize = DEFAULT_SIZE,
}: ResizableChartDemoProps) {
  const [size, setSize] = useState<ChartSize>(initialSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // The size lives in an effect because it is owned by the DOM, not by React:
  // the user drags a native CSS resize handle and we read the result back.
  // There is nothing to compute during render, so the lint rule's suggestion
  // to seed `useState` from the node does not apply.
  /* eslint-disable react-you-might-not-need-an-effect/no-initialize-state */
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, []);
  /* eslint-enable react-you-might-not-need-an-effect/no-initialize-state */

  return (
    <div
      ref={containerRef}
      style={{
        border: `1px dashed ${theme.colorBorder}`,
        height: initialSize.height,
        // `hidden` rather than `auto`: a scrollbar appearing inside the box
        // would shrink `contentRect`, shrinking the chart, which can oscillate.
        overflow: 'hidden',
        resize: 'both',
        width: initialSize.width,
      }}
    >
      {children(size)}
    </div>
  );
}

/**
 * Decorator form of {@link ResizableChartDemo}.
 *
 * Injects the live `width`/`height` as story args, so a story can declare them
 * as ordinary props and stay agnostic about where the numbers come from. Story
 * args win over nothing here - the size is appended last precisely so the
 * container stays authoritative over any stale value in `.args`.
 */
// Not a story - the storybook plugin lints every export in reach as one.
// eslint-disable-next-line storybook/prefer-pascal-case
export const withResizableChartDemo: Decorator = (Story, context) => (
  <ResizableChartDemo>
    {({ width, height }) => Story({ args: { ...context.args, width, height } })}
  </ResizableChartDemo>
);
