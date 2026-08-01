import { ensureIsArray, ValueOf } from '@zobi-ui/core';
import { GenericDataType } from '@zobi/core/common';
import { ControlPanelState, isDataset, isQueryResponse } from '../types';

export function checkColumnType(
  columnName: string,
  datasource: ValueOf<Pick<ControlPanelState, 'datasource'>>,
  columnTypes: GenericDataType[],
): boolean {
  if (isDataset(datasource)) {
    return ensureIsArray(datasource.columns).some(
      c =>
        c.type_generic !== undefined &&
        columnTypes.includes(c.type_generic) &&
        columnName === c.column_name,
    );
  }
  if (isQueryResponse(datasource)) {
    return ensureIsArray(datasource.columns)
      .filter(
        c =>
          c.type_generic !== undefined && columnTypes.includes(c.type_generic),
      )
      .map(c => c.column_name)
      .some(c => columnName === c);
  }
  return false;
}
