

import { GenericDataType } from '@zobi/core/common';
import { ChartDataResponseResult, VizType } from '@zobi-ui/core';
import { TableChartFormData } from '../types';

export const basicFormData: TableChartFormData = {
  datasource: '1__table',
  viz_type: VizType.Table,
  align_pn: false,
  color_pn: true,
  include_search: true,
  groupby: ['name', 'category'],
  metrics: ['sum__num'],
  order_desc: true,
  page_length: 0,
  percent_metrics: null,
  show_cell_bars: true,
  table_timestamp_format: 'smart_date',
};

export const basicData: Partial<ChartDataResponseResult> = {
  colnames: ['name', 'category', 'sum__num'],
  coltypes: [
    GenericDataType.String,
    GenericDataType.String,
    GenericDataType.Numeric,
  ],
  data: [
    { name: 'Michael', category: 'A', sum__num: 2467063 },
    { name: 'Christopher', category: 'B', sum__num: 1725265 },
    { name: 'David', category: 'A', sum__num: 1570516 },
    { name: 'James', category: 'C', sum__num: 1506025 },
    { name: 'John', category: 'B', sum__num: 1426074 },
    { name: 'Matthew', category: 'A', sum__num: 1355803 },
    { name: 'Robert', category: 'C', sum__num: 1314800 },
    { name: 'Daniel', category: 'B', sum__num: 1159354 },
    { name: 'Joseph', category: 'A', sum__num: 1114098 },
    { name: 'William', category: 'C', sum__num: 1113701 },
  ],
};
