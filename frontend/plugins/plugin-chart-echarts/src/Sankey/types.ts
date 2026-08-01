import {
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
} from '@zobi-ui/core';
import { BaseChartProps, BaseTransformedProps } from '../types';

export type SankeyFormData = QueryFormData & {
  colorScheme: string;
  metric: QueryFormMetric;
  source: QueryFormColumn;
  target: QueryFormColumn;
};

export interface SankeyChartProps extends BaseChartProps<SankeyFormData> {
  formData: SankeyFormData;
}

export type SankeyTransformedProps = BaseTransformedProps<SankeyFormData> & {};
