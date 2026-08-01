import { AdhocMetric } from '@zobi-ui/core';
import { GenericDataType } from '@zobi/core/common';

export const NUM_METRIC: AdhocMetric = {
  expressionType: 'SIMPLE',
  label: 'Sum(num)',
  column: {
    id: 336,
    type: 'BIGINT',
    type_generic: GenericDataType.Numeric,
    column_name: 'num',
    verbose_name: null,
    description: null,
    expression: '',
    filterable: false,
    groupby: false,
    is_dttm: false,
    database_expression: null,
    python_date_format: null,
  },
  aggregate: 'SUM',
};
