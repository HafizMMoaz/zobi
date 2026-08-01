import { useState, useCallback, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';

export default function useResizeDetectorByObserver() {
  const ref = useRef<HTMLDivElement>(null);
  const [{ width, height }, setChartPanelSize] = useState<{
    width?: number;
    height?: number;
  }>({});
  const onResize = useCallback(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect?.() || {};
      setChartPanelSize({ width, height });
    }
  }, []);
  // Use targetRef to observe the same element we measure
  useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 300,
    onResize,
    targetRef: ref,
  });

  return {
    ref,
    width,
    height,
  };
}
