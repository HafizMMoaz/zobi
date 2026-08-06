import { t, tn } from '@zobi.dev/extension-api/translation';
import { ensureIsArray, ExtraFormData, TimeGranularity } from '@zobi.dev/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FormItem,
  type FormItemProps,
  LabeledValue,
  Select,
  type SelectValue,
} from '@zobi.dev/core/components';
import { propertyComparator } from '@zobi.dev/core/components/Select/utils';
import { FilterPluginStyle, StatusMessage } from '../common';
import { PluginFilterTimeGrainProps } from './types';

export default function PluginFilterTimegrain(
  props: PluginFilterTimeGrainProps,
) {
  const {
    data,
    formData,
    height,
    width,
    setDataMask,
    setHoveredFilter,
    unsetHoveredFilter,
    setFocusedFilter,
    unsetFocusedFilter,
    setFilterActive,
    filterState,
    inputRef,
  } = props;
  const { defaultValue } = formData;

  const [value, setValue] = useState<string[]>(defaultValue ?? []);
  const durationMap = useMemo(
    () =>
      data.reduce(
        (agg, row) => {
          const { duration, name } = row as { duration: string; name: string };
          return { ...agg, [duration]: name };
        },
        {} as { [key in string]: string },
      ),
    [JSON.stringify(data)],
  );

  const handleChange = (values: SelectValue) => {
    const resultValue: string[] = ensureIsArray<string>(
      values as string | string[] | null | undefined,
    );
    const [timeGrain] = resultValue;
    const label = timeGrain ? durationMap[timeGrain] : undefined;

    const extraFormData: ExtraFormData = {};
    if (timeGrain) {
      extraFormData.time_grain_sqla = timeGrain as TimeGranularity;
    }
    setValue(resultValue);
    setDataMask({
      extraFormData,
      filterState: {
        label,
        value: resultValue.length ? resultValue : null,
      },
    });
  };

  useEffect(() => {
    handleChange(defaultValue ?? []);
    // Config Modal updates regenerate default values for filters
    // Using JSON.stringify for deep comparison until Immer is adopted
  }, [JSON.stringify(defaultValue)]);

  useEffect(() => {
    handleChange(filterState.value ?? []);
  }, [JSON.stringify(filterState.value)]);

  const placeholderText =
    (data || []).length === 0
      ? t('No data')
      : tn('%s option', '%s options', data.length, data.length);

  const formItemData: FormItemProps = {};
  if (filterState.validateMessage) {
    formItemData.extra = (
      <StatusMessage status={filterState.validateStatus}>
        {filterState.validateMessage}
      </StatusMessage>
    );
  }

  const options = (data || []).map(row => {
    const { name, duration } = row as { name: string; duration: string };
    return {
      label: name,
      value: duration,
    };
  });

  const sortComparator = useCallback(
    (a: LabeledValue, b: LabeledValue) => {
      if (formData.sortAscending === undefined) {
        return 0;
      }
      const labelComparator = propertyComparator('label');
      if (formData.sortAscending) {
        return labelComparator(a, b);
      }
      return labelComparator(b, a);
    },
    [formData.sortAscending],
  );

  return (
    <FilterPluginStyle height={height} width={width}>
      <FormItem validateStatus={filterState.validateStatus} {...formItemData}>
        <div onMouseEnter={setHoveredFilter} onMouseLeave={unsetHoveredFilter}>
          <Select
            name={formData.nativeFilterId}
            allowClear
            value={value}
            placeholder={placeholderText}
            onChange={handleChange}
            onBlur={unsetFocusedFilter}
            onFocus={setFocusedFilter}
            ref={inputRef}
            options={options}
            onOpenChange={setFilterActive}
            sortComparator={sortComparator}
          />
        </div>
      </FormItem>
    </FilterPluginStyle>
  );
}
