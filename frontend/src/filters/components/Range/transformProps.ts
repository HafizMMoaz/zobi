import { ChartProps } from '@zobi.dev/core';
import { noOp } from 'src/utils/common';

export default function transformProps(chartProps: ChartProps) {
  const {
    formData,
    height,
    hooks,
    queriesData,
    width,
    behaviors,
    filterState,
    inputRef,
    displaySettings,
  } = chartProps;
  const {
    setDataMask = noOp,
    setFocusedFilter = noOp,
    unsetFocusedFilter = noOp,
    setHoveredFilter = noOp,
    unsetHoveredFilter = noOp,
    setFilterActive = noOp,
  } = hooks;
  const { data } = queriesData[0];

  return {
    data,
    formData,
    behaviors,
    height,
    setDataMask,
    filterState,
    width,
    setHoveredFilter,
    unsetHoveredFilter,
    setFocusedFilter,
    unsetFocusedFilter,
    setFilterActive,
    inputRef,
    isOverflowingFilterBar: displaySettings?.isOverflowingFilterBar,
    filterBarOrientation: displaySettings?.filterBarOrientation,
  };
}
