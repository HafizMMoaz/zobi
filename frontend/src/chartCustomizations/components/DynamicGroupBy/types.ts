import { FilterState, QueryFormData } from '@zobi-ui/core';
import { RefObject } from 'react';
import type { RefSelectProps } from '@zobi-ui/core/components';
import { PluginFilterHooks, PluginFilterStylesProps } from '../types';

export interface DatasetReference {
  value: string | number;
  label?: string;
  table_name?: string;
  schema?: string;
}

export interface ColumnOption {
  label: string;
  value: string;
}

interface PluginFilterGroupByCustomizeProps {
  dataset?: string | number | DatasetReference | null;
  datasetInfo?: {
    label: string;
    value: number;
    table_name: string;
  };
  column?: string | string[] | null;
  description?: string;
  sortFilter?: boolean;
  sortAscending?: boolean;
  sortMetric?: string;
  hasDefaultValue?: boolean;
  defaultValue?: string | string[] | null;
  isRequired?: boolean;
  selectFirst?: boolean;
  canSelectMultiple?: boolean;
  aggregation?: string;
  enableEmptyFilter?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
}

export type PluginFilterGroupByQueryFormData = QueryFormData &
  PluginFilterStylesProps &
  PluginFilterGroupByCustomizeProps;

export interface ColumnData {
  column_name: string;
  verbose_name?: string | null;
  dtype?: number;
}

export type PluginFilterGroupByProps = PluginFilterStylesProps & {
  data: (ColumnOption | ColumnData)[];
  filterState: FilterState;
  formData: PluginFilterGroupByQueryFormData;
  inputRef: RefObject<RefSelectProps>;
} & PluginFilterHooks;

export const DEFAULT_FORM_DATA: PluginFilterGroupByCustomizeProps = {
  dataset: null,
  column: null,
  sortFilter: false,
  sortAscending: true,
  canSelectMultiple: true,
  defaultValue: null,
};
