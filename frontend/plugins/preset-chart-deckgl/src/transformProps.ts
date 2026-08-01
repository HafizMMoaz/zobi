
import { ChartProps } from '@zobi-ui/core';

const NOOP = () => {};

export default function transformProps(chartProps: ChartProps) {
  const {
    datasource,
    height,
    hooks,
    queriesData,
    rawFormData,
    width,
    filterState,
    emitCrossFilters,
  } = chartProps;
  const {
    onAddFilter = NOOP,
    onContextMenu = NOOP,
    setControlValue = NOOP,
    setDataMask = NOOP,
  } = hooks;

  return {
    datasource,
    emitCrossFilters,
    formData: rawFormData,
    height,
    onAddFilter,
    onContextMenu,
    payload: queriesData[0],
    setControlValue,
    filterState,
    viewport: {
      ...rawFormData.viewport,
      height,
      width,
    },
    width,
    setDataMask,
  };
}
