import { t } from '@zobi.dev/extension-api/translation';
import { ensureIsArray, ExtraFormData, TimeGranularity } from '@zobi.dev/core';
import { tn } from '@zobi.dev/extension-api/translation';
import { useEffect, useMemo, useState } from 'react';
import {
  FormItem,
  type FormItemProps,
  Select,
} from '@zobi.dev/core/components';
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
        (agg, { duration, name }: { duration: string; name: string }) => ({
          ...agg,
          [duration]: name,
        }),
        {} as { [key in string]: string },
      ),
    [JSON.stringify(data)],
  );

  const handleChange = (values: string[] | string | undefined | null) => {
    const resultValue: string[] = ensureIsArray<string>(values);
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
    // I think after Config Modal update some filter it re-creates default value for all other filters
    // so we can process it like this `JSON.stringify` or start to use `Immer`
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

  const options = (data || [])
    .map((row: { name: string; duration: string }) => {
      const { name, duration } = row;
      return {
        label: name,
        value: duration,
      };
    })
    // Apply allowlist filter if time_grains is configured, but keep current selection visible
    .filter(option => {
      const allowlist = formData.time_grains;
      if (!allowlist || allowlist.length === 0) {
        return true;
      }
      return allowlist.includes(option.value) || value.includes(option.value);
    });

  return (
    <FilterPluginStyle height={height} width={width}>
      <FormItem validateStatus={filterState.validateStatus} {...formItemData}>
        <Select
          name={formData.nativeFilterId}
          allowClear
          value={value}
          placeholder={placeholderText}
          // @ts-expect-error
          onChange={handleChange}
          onBlur={unsetFocusedFilter}
          onFocus={setFocusedFilter}
          onMouseEnter={setHoveredFilter}
          onMouseLeave={unsetHoveredFilter}
          ref={inputRef}
          options={options}
          onOpenChange={setFilterActive}
          sortComparator={() => 0} // Disable frontend sorting to preserve backend order
        />
      </FormItem>
    </FilterPluginStyle>
  );
}
