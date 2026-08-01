import {
  AdhocFilter,
  DataMask,
  NativeFilterType,
  NativeFilterScope,
  Filter,
  Divider,
  ChartCustomizationDivider,
  ColumnOption,
  ChartCustomization,
} from '@zobi-ui/core';
import { ReactNode } from 'react';

export interface NativeFiltersFormItem {
  scope: NativeFilterScope;
  name: string;
  filterType: string;
  dataset: {
    value: number;
    label: string | ReactNode;
  };
  column: string;
  controlValues: {
    [key: string]: any;
  };
  requiredFirst: {
    [key: string]: boolean;
  };
  defaultValue: any;
  defaultDataMask: DataMask;
  dependencies?: string[];
  sortMetric: string | null;
  adhoc_filters?: AdhocFilter[];
  time_range?: string;
  granularity_sqla?: string;
  time_grains?: string[];
  type: typeof NativeFilterType.NativeFilter;
  description: string;
}
export interface NativeFilterDivider {
  id: string;
  type: typeof NativeFilterType.Divider;
  title: string;
  description: string;
}

export interface NativeFiltersForm {
  filters: Record<string, NativeFiltersFormItem | NativeFilterDivider>;
  changed?: boolean;
}

export interface ChartCustomizationsFormItem {
  scope: NativeFilterScope;
  name: string;
  filterType: string;
  dataset: {
    value: number;
    label: string | ReactNode;
  };
  column: string;
  controlValues: {
    [key: string]: any;
  };
  requiredFirst: {
    [key: string]: boolean;
  };
  defaultValue: any;
  defaultDataMask: DataMask;
  dependencies?: string[];
  sortMetric: string | null;
  adhoc_filters?: AdhocFilter[];
  time_range?: string;
  granularity_sqla?: string;
  type: typeof NativeFilterType.NativeFilter;
  description: string;
  datasetInfo?: {
    label: string | ReactNode;
    value: number;
    table_name?: string;
  };
  sortFilter?: boolean;
  sortAscending?: boolean;
  hasDefaultValue?: boolean;
  isRequired?: boolean;
  selectFirst?: boolean;
  defaultValueQueriesData?: ColumnOption[] | null;
  aggregation?: string;
  canSelectMultiple?: boolean;
}

export interface ChartCustomizationsForm {
  // keep the filters data structure for reusable components
  filters: Record<
    string,
    ChartCustomizationsFormItem | ChartCustomizationDivider
  >;
  changed?: boolean;
}

export type FilterChangesType = {
  modified: string[];
  deleted: string[];
  reordered: string[];
};

export type SaveFilterChangesType = {
  modified: (Filter | Divider)[];
} & Omit<FilterChangesType, 'modified'>;

export type SaveChangesType = {
  filterChanges?: SaveFilterChangesType;
  customizationChanges?: {
    modified: (ChartCustomization | ChartCustomizationDivider)[];
    deleted: string[];
    reordered: string[];
  };
};

export type FilterRemoval =
  | null
  | {
      isPending: true; // the filter sticks around for a moment before removal is finalized
      timerId: number; // id of the timer that finally removes the filter
    }
  | { isPending: false };

export type ItemType = 'filter' | 'customization';

export interface ItemState {
  changes: FilterChangesType;
  newIds: string[];
  removed: Record<string, FilterRemoval>;
  errored: string[];
}

export interface ItemsState {
  filters: ItemState;
  customizations: ItemState;
}
