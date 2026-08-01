import {
  AdhocColumn,
  buildQueryContext,
  ensureIsArray,
  isPhysicalColumn,
} from '@zobi-ui/core';
import { boxplotOperator } from '@zobi-ui/chart-controls';
import { BoxPlotQueryFormData } from './types';

export default function buildQuery(formData: BoxPlotQueryFormData) {
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      columns: [
        ...(ensureIsArray(formData.columns).length === 0 &&
        formData.granularity_sqla
          ? [formData.granularity_sqla] // for backwards compatible: if columns control is empty and granularity_sqla was set, the time columns is default distributed column.
          : ensureIsArray(formData.columns)
        ).map(col => {
          if (
            isPhysicalColumn(col) &&
            formData.time_grain_sqla &&
            formData?.temporal_columns_lookup?.[col]
          ) {
            return {
              timeGrain: formData.time_grain_sqla,
              columnType: 'BASE_AXIS',
              sqlExpression: col,
              label: col,
              expressionType: 'SQL',
            } as AdhocColumn;
          }
          return col;
        }),
        ...ensureIsArray(formData.groupby),
      ],
      series_columns: formData.groupby,
      post_processing: [boxplotOperator(formData, baseQueryObject)],
    },
  ]);
}
