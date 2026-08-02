import { ensureIsArray, isDefined, QueryColumn, ValueOf } from '@zobi.dev/core';
import {
  ColumnMeta,
  ControlPanelState,
  isDataset,
  isQueryResponse,
} from '@zobi.dev/chart-controls';

export function getTemporalColumns(
  datasource: ValueOf<Pick<ControlPanelState, 'datasource'>>,
) {
  const rv: {
    temporalColumns: ColumnMeta[] | QueryColumn[];
    defaultTemporalColumn: string | null | undefined;
  } = {
    temporalColumns: [],
    defaultTemporalColumn: undefined,
  };

  if (isDataset(datasource)) {
    rv.temporalColumns = ensureIsArray(datasource.columns).filter(
      c => c.is_dttm,
    );
  }
  if (isQueryResponse(datasource)) {
    rv.temporalColumns = ensureIsArray(datasource.columns).filter(
      c => c.is_dttm,
    );
  }

  if (isDataset(datasource)) {
    rv.defaultTemporalColumn = datasource.main_dttm_col;
  }
  if (!isDefined(rv.defaultTemporalColumn)) {
    rv.defaultTemporalColumn =
      (rv.temporalColumns[0] as ColumnMeta)?.column_name ??
      (rv.temporalColumns[0] as QueryColumn)?.name;
  }

  return rv;
}

export function isTemporalColumn(
  columnName: string,
  datasource: ValueOf<Pick<ControlPanelState, 'datasource'>>,
): boolean {
  const columns = getTemporalColumns(datasource).temporalColumns;
  for (let i = 0; i < columns.length; i += 1) {
    if (columns[i].column_name === columnName) {
      return true;
    }
  }
  return false;
}
