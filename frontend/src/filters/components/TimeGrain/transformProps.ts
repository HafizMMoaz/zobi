import { ChartProps } from '@zobi-ui/core';
import { noOp } from 'src/utils/common';
import { DEFAULT_FORM_DATA } from './types';

export default function transformProps(chartProps: ChartProps) {
  const { formData, height, hooks, queriesData, width, filterState, inputRef } =
    chartProps;
  const {
    setDataMask = noOp,
    setHoveredFilter = noOp,
    unsetHoveredFilter = noOp,
    setFocusedFilter = noOp,
    unsetFocusedFilter = noOp,
    setFilterActive = noOp,
  } = hooks;

  const { data } = queriesData[0];

  return {
    filterState,
    width,
    height,
    data,
    formData: { ...DEFAULT_FORM_DATA, ...formData },
    setDataMask,
    setHoveredFilter,
    unsetHoveredFilter,
    setFocusedFilter,
    unsetFocusedFilter,
    setFilterActive,
    inputRef,
  };
}
