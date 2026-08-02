import {
  DataRecordFilters,
  DataRecordValue,
  DTTM_ALIAS,
  ensureIsArray,
  TimeGranularity,
} from '@zobi.dev/core';

type GetCrossFilterDataMaskProps = {
  key: string;
  value: DataRecordValue;
  filters?: DataRecordFilters;
  timeGrain?: TimeGranularity;
  isActiveFilterValue: (key: string, val: DataRecordValue) => boolean;
  timestampFormatter: (value: DataRecordValue) => string;
};

type BuildSelectionCrossFilterProps = {
  key: string;
  values: DataRecordValue[];
  timeGrain?: TimeGranularity;
  timestampFormatter: (value: DataRecordValue) => string;
};

export const buildSelectionCrossFilterDataMask = ({
  key,
  values,
  timeGrain,
  timestampFormatter,
}: BuildSelectionCrossFilterProps) => {
  if (values.length === 0) {
    return {
      dataMask: {
        extraFormData: { filters: [] },
        filterState: { label: null, value: null, filters: null },
      },
    };
  }

  const updatedFilters: DataRecordFilters = { [key]: values };
  const isTimestamp = key === DTTM_ALIAS;
  const label = values
    .map(v => (isTimestamp ? timestampFormatter(v) : v))
    .join(', ');

  return {
    dataMask: {
      extraFormData: {
        filters: [
          {
            col: key,
            op: 'IN' as const,
            val: values.map(el => (el instanceof Date ? el.getTime() : el!)),
            grain: isTimestamp ? timeGrain : undefined,
          },
        ],
      },
      filterState: {
        label,
        value: [values],
        filters: updatedFilters,
      },
    },
  };
};

export const getCrossFilterDataMask = ({
  key,
  value,
  filters,
  timeGrain,
  isActiveFilterValue,
  timestampFormatter,
}: GetCrossFilterDataMaskProps) => {
  let updatedFilters = { ...filters };
  if (filters && isActiveFilterValue(key, value)) {
    updatedFilters = {};
  } else {
    updatedFilters = {
      [key]: [value],
    };
  }
  if (Array.isArray(updatedFilters[key]) && updatedFilters[key].length === 0) {
    delete updatedFilters[key];
  }

  const groupBy = Object.keys(updatedFilters);
  const groupByValues = Object.values(updatedFilters);
  const labelElements: string[] = [];
  groupBy.forEach(col => {
    const isTimestamp = col === DTTM_ALIAS;
    const filterValues = ensureIsArray(updatedFilters?.[col]);
    if (filterValues.length) {
      const valueLabels = filterValues.map(value =>
        isTimestamp ? timestampFormatter(value) : value,
      );
      labelElements.push(`${valueLabels.join(', ')}`);
    }
  });

  return {
    dataMask: {
      extraFormData: {
        filters:
          groupBy.length === 0
            ? []
            : groupBy.map(col => {
                const val = ensureIsArray(updatedFilters?.[col]);
                if (!val.length)
                  return {
                    col,
                    op: 'IS NULL' as const,
                  };
                return {
                  col,
                  op: 'IN' as const,
                  val: val.map(el => (el instanceof Date ? el.getTime() : el!)),
                  grain: col === DTTM_ALIAS ? timeGrain : undefined,
                };
              }),
      },
      filterState: {
        label: labelElements.join(', '),
        value: groupByValues.length ? groupByValues : null,
        filters:
          updatedFilters && Object.keys(updatedFilters).length
            ? updatedFilters
            : null,
      },
    },
    isCurrentValueSelected: isActiveFilterValue(key, value),
  };
};
