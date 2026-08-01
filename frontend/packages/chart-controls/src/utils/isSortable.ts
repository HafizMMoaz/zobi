import {
  getColumnLabel,
  isPhysicalColumn,
  QueryFormColumn,
} from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { checkColumnType, ControlStateMapping } from '..';

export function isSortable(controls: ControlStateMapping): boolean {
  const isForcedCategorical =
    checkColumnType(
      getColumnLabel(controls?.x_axis?.value as QueryFormColumn),
      controls?.datasource?.datasource,
      [GenericDataType.Numeric],
    ) && !!controls?.xAxisForceCategorical?.value;

  const xAxisValue = controls?.x_axis?.value as QueryFormColumn;

  // Given that we don't know the type of a custom SQL column,
  // we treat it as sortable and give the responsibility to the
  // user to provide a sortable result.
  const isCustomSQL = !isPhysicalColumn(xAxisValue);

  return (
    isForcedCategorical ||
    isCustomSQL ||
    checkColumnType(
      getColumnLabel(xAxisValue),
      controls?.datasource?.datasource,
      [GenericDataType.String, GenericDataType.Boolean],
    )
  );
}
