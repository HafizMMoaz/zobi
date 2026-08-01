import { omit } from 'lodash';

import {
  AdhocColumn,
  isAdhocColumn,
  isPhysicalColumn,
  QueryFormColumn,
  QueryFormData,
  QueryObject,
} from './types';
import { isXAxisSet } from './getXAxis';

export function normalizeTimeColumn(
  formData: QueryFormData,
  queryObject: QueryObject,
): QueryObject {
  // The formData should be "raw form_data" -- the snake_case version of formData rather than camelCase.
  if (!isXAxisSet(formData)) {
    return queryObject;
  }

  const { columns: _columns, extras: _extras } = queryObject;
  const mutatedColumns: QueryFormColumn[] = [...(_columns || [])];
  const axisIdx = _columns?.findIndex(
    col =>
      (isPhysicalColumn(col) &&
        isPhysicalColumn(formData.x_axis) &&
        col === formData.x_axis) ||
      (isAdhocColumn(col) &&
        isAdhocColumn(formData.x_axis) &&
        col.sqlExpression === formData.x_axis.sqlExpression),
  );
  if (
    axisIdx !== undefined &&
    axisIdx > -1 &&
    formData.x_axis &&
    Array.isArray(_columns)
  ) {
    if (isAdhocColumn(_columns[axisIdx])) {
      mutatedColumns[axisIdx] = {
        timeGrain: _extras?.time_grain_sqla,
        columnType: 'BASE_AXIS',
        ...(_columns[axisIdx] as AdhocColumn),
      };
    } else {
      mutatedColumns[axisIdx] = {
        timeGrain: _extras?.time_grain_sqla,
        columnType: 'BASE_AXIS',
        sqlExpression: formData.x_axis,
        label: formData.x_axis,
        expressionType: 'SQL',
        isColumnReference: true,
      };
    }

    const newQueryObject = omit(queryObject, ['is_timeseries']);
    newQueryObject.columns = mutatedColumns;

    return newQueryObject;
  }

  // fallback, return original queryObject
  return queryObject;
}
