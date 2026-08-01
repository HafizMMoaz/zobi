import {
  AppSection,
  Behavior,
  ChartProps,
  DataRecord,
  FilterState,
  QueryFormData,
  ChartDataResponseResult,
} from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { RefObject } from 'react';
import { FilterBarOrientation } from 'src/dashboard/types';
import { PluginFilterHooks, PluginFilterStylesProps } from '../types';

export type SelectValue = (number | string | null)[] | null | undefined;

export enum SelectFilterOperatorType {
  Exact = 'exact',
  Contains = 'ilike_contains',
  StartsWith = 'ilike_starts_with',
  EndsWith = 'ilike_ends_with',
}

export interface PluginFilterSelectCustomizeProps {
  defaultValue?: SelectValue;
  enableEmptyFilter: boolean;
  inverseSelection: boolean;
  creatable: boolean;
  multiSelect: boolean;
  defaultToFirstItem: boolean;
  searchAllOptions: boolean;
  sortAscending?: boolean;
  sortMetric?: string;
  operatorType?: SelectFilterOperatorType;
}

export type PluginFilterSelectQueryFormData = QueryFormData &
  PluginFilterStylesProps &
  PluginFilterSelectCustomizeProps;

export interface PluginFilterSelectChartProps extends ChartProps {
  queriesData: ChartDataResponseResult[];
}

export type PluginFilterSelectProps = PluginFilterStylesProps & {
  coltypeMap: Record<string, GenericDataType>;
  data: DataRecord[];
  behaviors: Behavior[];
  appSection: AppSection;
  formData: PluginFilterSelectQueryFormData;
  filterState: FilterState;
  isRefreshing: boolean;
  showOverflow: boolean;
  parentRef?: RefObject<any>;
  inputRef?: RefObject<any>;
  filterBarOrientation?: FilterBarOrientation;
  isOverflowingFilterBar?: boolean;
  clearAllTrigger?: Record<string, boolean>;
  onClearAllComplete?: (filterId: string) => void;
} & PluginFilterHooks;

export const DEFAULT_FORM_DATA: PluginFilterSelectCustomizeProps = {
  defaultValue: null,
  enableEmptyFilter: false,
  inverseSelection: false,
  defaultToFirstItem: false,
  creatable: true,
  multiSelect: true,
  searchAllOptions: false,
  sortAscending: true,
  operatorType: SelectFilterOperatorType.Exact,
};
