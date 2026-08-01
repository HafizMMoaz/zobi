import { ChartProps } from '@zobi-ui/core';

export default function transformProps(chartProps: ChartProps) {
  const { formData, height, width, filterState, hooks, ownState } = chartProps;

  return {
    formData,
    height,
    width,
    filterState,
    setDataMask: hooks.setDataMask,
    ownState,
  };
}
