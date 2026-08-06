import {
  createRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  ForwardedRef,
} from 'react';

import { withTheme } from '@zobi.dev/extension-api/theme';

import type {
  ListViewFilterValue as FilterValue,
  ListViewFilters as Filters,
  InternalFilter,
  SelectOption,
} from '../types';
import type { FilterHandler } from './types';
import SearchFilter from './Search';
import SelectFilter from './Select';
import DateRangeFilter from './DateRange';
import NumericalRangeFilter from './NumericalRange';

interface UIFiltersProps {
  filters: Filters;
  internalFilters: InternalFilter[];
  updateFilterValue: (id: number, value: FilterValue['value']) => void;
}

function UIFilters(
  { filters, internalFilters = [], updateFilterValue }: UIFiltersProps,
  ref: ForwardedRef<{ clearFilters: () => void }>,
) {
  const filterRefs = useMemo(
    () =>
      Array.from({ length: filters.length }, () => createRef<FilterHandler>()),
    [filters.length],
  );

  useImperativeHandle(ref, () => ({
    clearFilters: () => {
      filterRefs.forEach((filter: any) => {
        filter.current?.clearFilter?.();
      });
    },
    clearFilterById: (id: string) => {
      const index = filters.findIndex(f => f.id === id);
      if (index >= 0) {
        filterRefs[index]?.current?.clearFilter?.();
      }
    },
  }));

  return (
    <>
      {filters.map(
        (
          {
            Header,
            fetchSelects,
            key,
            id,
            input,
            optionFilterProps,
            paginate,
            selects,
            toolTipDescription,
            onFilterUpdate,
            loading,
            dateFilterValueType,
            min,
            max,
            popupStyle,
            autoComplete,
            inputName,
          },
          index,
        ) => {
          const initialValue = internalFilters?.[index]?.value;
          if (input === 'select') {
            return (
              <SelectFilter
                ref={filterRefs[index]}
                Header={Header}
                fetchSelects={fetchSelects}
                initialValue={initialValue}
                key={key}
                name={id}
                onSelect={(
                  option: SelectOption | undefined,
                  isClear?: boolean,
                ) => {
                  if (onFilterUpdate) {
                    // Filter change triggers both onChange AND onClear, only want to track onChange
                    if (!isClear) {
                      onFilterUpdate(option);
                    }
                  }

                  updateFilterValue(index, option);
                }}
                optionFilterProps={optionFilterProps}
                paginate={paginate}
                selects={selects}
                loading={loading ?? false}
                dropdownStyle={popupStyle}
              />
            );
          }
          if (input === 'search' && typeof Header === 'string') {
            return (
              <SearchFilter
                ref={filterRefs[index]}
                Header={Header}
                initialValue={initialValue}
                key={key}
                name={inputName ?? id}
                toolTipDescription={toolTipDescription}
                onSubmit={(value: string) => {
                  if (onFilterUpdate) {
                    onFilterUpdate(value);
                  }

                  updateFilterValue(index, value);
                }}
                autoComplete={autoComplete}
              />
            );
          }
          if (input === 'datetime_range') {
            return (
              <DateRangeFilter
                ref={filterRefs[index]}
                Header={Header}
                initialValue={initialValue}
                key={key}
                name={id}
                onSubmit={value => updateFilterValue(index, value)}
                dateFilterValueType={dateFilterValueType || 'unix'}
              />
            );
          }
          if (input === 'numerical_range') {
            return (
              <NumericalRangeFilter
                ref={filterRefs[index]}
                Header={Header}
                initialValue={initialValue}
                min={min}
                max={max}
                key={key}
                name={id}
                onSubmit={value => updateFilterValue(index, value)}
              />
            );
          }
          return null;
        },
      )}
    </>
  );
}

export default withTheme(forwardRef(UIFilters));
