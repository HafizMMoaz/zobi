import { t, tn } from '@zobi.dev/extension-api/translation';
import { ensureIsArray, ExtraFormData } from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { useEffect, useState } from 'react';
import {
  FormItem,
  type FormItemProps,
  Select,
} from '@zobi.dev/core/components';
import { FilterPluginStyle, StatusMessage } from '../common';
import { PluginFilterTimeColumnProps } from './types';

export default function PluginFilterTimeColumn(
  props: PluginFilterTimeColumnProps,
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

  const handleChange = (value?: string[] | string | null) => {
    const resultValue: string[] = ensureIsArray<string>(value);
    setValue(resultValue);
    const extraFormData: ExtraFormData = {};
    if (resultValue.length) {
      extraFormData.granularity_sqla = resultValue[0];
    }

    setDataMask({
      extraFormData,
      filterState: {
        value: resultValue.length ? resultValue : null,
      },
    });
  };

  useEffect(() => {
    handleChange(defaultValue ?? null);
    // I think after Config Modal update some filter it re-creates default value for all other filters
    // so we can process it like this `JSON.stringify` or start to use `Immer`
  }, [JSON.stringify(defaultValue)]);

  useEffect(() => {
    handleChange(filterState.value ?? null);
  }, [JSON.stringify(filterState.value)]);

  const timeColumns = (data || []).filter(
    row => row.dtype === GenericDataType.Temporal,
  );

  const placeholderText =
    timeColumns.length === 0
      ? t('No time columns')
      : tn('%s option', '%s options', timeColumns.length, timeColumns.length);

  const formItemData: FormItemProps = {};
  if (filterState.validateMessage) {
    formItemData.extra = (
      <StatusMessage status={filterState.validateStatus}>
        {filterState.validateMessage}
      </StatusMessage>
    );
  }

  const options = timeColumns.map(row => {
    const { column_name: columnName, verbose_name: verboseName } = row as {
      column_name: string;
      verbose_name: string | null;
    };
    return {
      label: verboseName ?? columnName,
      value: columnName,
    };
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
        />
      </FormItem>
    </FilterPluginStyle>
  );
}
