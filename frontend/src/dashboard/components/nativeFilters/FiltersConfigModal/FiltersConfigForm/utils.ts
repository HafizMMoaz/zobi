import { flatMapDeep } from 'lodash';
import type { FormInstance } from '@zobi.dev/core/components';
import { useState, useCallback } from 'react';
import { CustomControlItem, Dataset } from '@zobi.dev/chart-controls';
import { Column, ensureIsArray } from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { DatasourcesState, ChartsState } from 'src/dashboard/types';
import { FILTER_SUPPORTED_TYPES } from './constants';

const FILTERS_FIELD_NAME = 'filters';

type TimeGrainTuple = [string, string];

export const getTimeGrainOptions = (
  timeGrains: TimeGrainTuple[] = [],
): { value: string; label: string }[] =>
  timeGrains.map(timeGrain => {
    const [value, label] = timeGrain;
    return { value, label: label || value };
  });

export const useForceUpdate = (isActive = true) => {
  const [, updateState] = useState({});
  return useCallback(() => {
    if (isActive) {
      updateState({});
    }
  }, [isActive]);
};

export const setNativeFilterFieldValues = (
  form: FormInstance,
  filterId: string,
  values: object,
) => {
  const formFilters = form.getFieldValue(FILTERS_FIELD_NAME) || {};
  form.setFields([
    {
      name: FILTERS_FIELD_NAME,
      value: {
        ...formFilters,
        [filterId]: {
          ...formFilters[filterId],
          ...values,
        },
      },
    },
  ]);
};

export const getControlItems = (
  controlConfig: { [key: string]: any } = {},
): CustomControlItem[] =>
  (flatMapDeep(controlConfig.controlPanelSections)?.reduce(
    (acc: any, { controlSetRows = [] }: any) => [
      ...acc,
      ...flatMapDeep(controlSetRows),
    ],
    [],
  ) as CustomControlItem[]) ?? [];

// TODO: add column_types field to Dataset
// We return true if column_types is undefined or empty as a precaution against backend failing to return column_types
export const hasTemporalColumns = (
  dataset: Dataset & { column_types: GenericDataType[] },
) => {
  const columnTypes = ensureIsArray(dataset?.column_types);
  return (
    columnTypes.length === 0 || columnTypes.includes(GenericDataType.Temporal)
  );
};

// Determines whether to show the time range picker in pre-filter settings.
// Returns true if dataset is undefined (precautionary default) or has temporal columns.
export const shouldShowTimeRangePicker = (
  currentDataset: (Dataset & { column_types: GenericDataType[] }) | undefined,
): boolean => (currentDataset ? hasTemporalColumns(currentDataset) : true);

export const doesColumnMatchFilterType = (filterType: string, column: Column) =>
  !column.type_generic ||
  !(filterType in FILTER_SUPPORTED_TYPES) ||
  FILTER_SUPPORTED_TYPES[
    filterType as keyof typeof FILTER_SUPPORTED_TYPES
  ]?.includes(column.type_generic);

// Validates that a filter default value is present when the default value option is enabled.
// For range filters, at least one of the two values must be non-null.
// For other filters (e.g., filter_select), the value must be non-empty.
// Arrays must have at least one element (empty array means no selection).
export const isValidFilterValue = (
  value: unknown,
  isRangeFilter: boolean,
): boolean => {
  if (isRangeFilter) {
    return Array.isArray(value) && (value[0] !== null || value[1] !== null);
  }
  // For multi-select filters, an empty array means no selection was made
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  // For other values, check if truthy (note: 0 is falsy but unlikely for non-range filters)
  return !!value;
};

export const mostUsedDataset = (
  datasets: DatasourcesState,
  charts: ChartsState,
) => {
  const map = new Map<string, number>();
  let mostUsedDataset = '';
  let maxCount = 0;

  Object.values(charts).forEach(chart => {
    const { form_data: formData } = chart;
    if (formData) {
      const { datasource } = formData;
      const count = (map.get(datasource) || 0) + 1;
      map.set(datasource, count);

      if (count > maxCount) {
        maxCount = count;
        mostUsedDataset = datasource;
      }
    }
  });

  return datasets[mostUsedDataset]?.id;
};
