import { isAdhocColumn, isPhysicalColumn } from '@zobi.dev/core';
import type { ColumnMeta, ControlPanelsContainerProps } from '../types';

export function displayTimeRelatedControls({
  controls,
}: ControlPanelsContainerProps) {
  if (!controls?.x_axis) {
    return true;
  }

  const xAxis = controls?.x_axis;
  const xAxisValue = xAxis?.value;
  if (isAdhocColumn(xAxisValue)) {
    return true;
  }
  if (isPhysicalColumn(xAxisValue)) {
    return !!(xAxis?.options ?? []).find(
      (col: ColumnMeta) => col?.column_name === xAxisValue,
    )?.is_dttm;
  }
  return false;
}
