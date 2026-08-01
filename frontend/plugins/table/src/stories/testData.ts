import { ChartDataResponseResult, VizType } from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import {
  TableChartFormData,
  TableChartProps,
} from '@zobi.dev/table';
// eslint-disable-next-line import/extensions
// @ts-ignore -- TS6307: this file is outside the tsconfig project scope, @ts-expect-error does not suppress project-level errors
import birthNamesJson from './birthNames.json';

export const birthNames = birthNamesJson as unknown as TableChartProps;

export const basicFormData: TableChartFormData = {
  datasource: '1__table',
  viz_type: VizType.Table,
  align_pn: false,
  color_pn: false,
  include_search: true,
  metrics: ['sum__num', 'MAX(ds)'],
  order_desc: true,
  page_length: 0,
  percent_metrics: null,
  show_cell_bars: true,
  table_filter: false,
  table_timestamp_format: 'smart_date',
};

export const basicData: Partial<ChartDataResponseResult> = {
  colnames: ['name', 'sum__num', 'MAX(ds)', 'Abc.com'],
  coltypes: [
    GenericDataType.String,
    GenericDataType.Numeric,
    GenericDataType.Temporal,
    GenericDataType.String,
  ],
  data: [
    {
      name: 'Michael',
      sum__num: 2467063,
      'MAX(ds)': '2008-01-01T00:00:00',
      'Abc.com': 110,
    },
    {
      name: 'Christopher',
      sum__num: 1725265,
      'MAX(ds)': '2008-01-01T00:00:00',
      'Abc.com': 119,
    },
    {
      name: 'David',
      sum__num: 1570516,
      'MAX(ds)': '2008-01-01T00:00:00',
      'Abc.com': 120,
    },
    {
      name: 'James',
      sum__num: 1506025,
      'MAX(ds)': '2008-01-01T00:00:00',
      'Abc.com': 120,
    },
    {
      name: 'John',
      sum__num: 1426074,
      'MAX(ds)': '2008-01-01T00:00:00',
      'Abc.com': 120,
    },
    {
      name: 'Matthew',
      sum__num: 1355803,
      'MAX(ds)': '2008-01-01T00:00:00',
      'Abc.com': 120,
    },
    {
      name: 'Robert',
      sum__num: 1314800,
      'MAX(ds)': '2008-01-01T00:00:00',
      'Abc.com': 120,
    },
    {
      name: 'Daniel',
      sum__num: 1159354,
      'MAX(ds)': '2008-01-01T00:00:00',
      'Abc.com': 120,
    },
    {
      name: 'Joseph',
      sum__num: 1114098,
      'MAX(ds)': '2008-01-01T00:00:00',
      'Abc.com': 120,
    },
    {
      name: 'William',
      sum__num: 1113701,
      'MAX(ds)': '2008-01-01T00:00:00',
      'Abc.com': 120,
    },
  ],
};
