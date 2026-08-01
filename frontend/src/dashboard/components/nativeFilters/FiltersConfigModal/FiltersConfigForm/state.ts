import { useEffect, useState } from 'react';
import type { FormInstance } from '@zobi.dev/core/components';
import { t } from '@zobi.dev/extension-api/translation';
import { ChartCustomization, Filter } from '@zobi.dev/core';
import { NativeFiltersForm, NativeFiltersFormItem } from '../types';
import { setNativeFilterFieldValues, useForceUpdate } from './utils';

// When some fields in form changed we need re-fetch data for Filter defaultValue
// eslint-disable-next-line import/prefer-default-export
export const useBackendFormUpdate = (
  form: FormInstance<NativeFiltersForm>,
  filterId: string,
) => {
  const forceUpdate = useForceUpdate();
  const formFilter = form.getFieldValue('filters')?.[filterId];
  useEffect(() => {
    setNativeFilterFieldValues(form, filterId, {
      isDataDirty: true,
      defaultValueQueriesData: null,
    });
    forceUpdate();
  }, [
    form,
    formFilter?.filterType,
    formFilter?.column,
    formFilter?.dataset?.value,
    JSON.stringify(formFilter?.adhoc_filters),
    formFilter?.time_range,
    forceUpdate,
    filterId,
  ]);
};

export const useDefaultValue = (
  formFilter?: NativeFiltersFormItem,
  filterToEdit?: Filter,
  customizationToEdit?: ChartCustomization,
): [boolean, boolean, string, Function] => {
  const enableEmptyFilter = !!formFilter?.controlValues?.enableEmptyFilter;
  const defaultToFirstItem = !!formFilter?.controlValues?.defaultToFirstItem;

  const [hasDefaultValue, setHasPartialDefaultValue] = useState(false);
  const [isRequired, setIsRequired] = useState(enableEmptyFilter);
  const [defaultValueTooltip, setDefaultValueTooltip] = useState('');

  const setHasDefaultValue = (value = false) => {
    const required = enableEmptyFilter && !defaultToFirstItem;
    setIsRequired(required);
    setHasPartialDefaultValue(required ? true : value);
  };

  useEffect(() => {
    setHasDefaultValue(
      defaultToFirstItem
        ? false
        : !!formFilter?.defaultDataMask?.filterState?.value,
    );
  }, [defaultToFirstItem, enableEmptyFilter]);

  useEffect(() => {
    const defaultValue =
      filterToEdit?.defaultDataMask?.filterState?.value ||
      customizationToEdit?.defaultDataMask?.filterState?.value;

    setHasDefaultValue(defaultToFirstItem ? false : !!defaultValue);
  }, [filterToEdit, customizationToEdit, defaultToFirstItem]);

  useEffect(() => {
    let tooltip = '';
    if (defaultToFirstItem) {
      tooltip = t(
        'Default value set automatically when "Select first filter value by default" is checked',
      );
    } else if (isRequired) {
      tooltip = t(
        'Default value must be set when "Filter value is required" is checked',
      );
    } else if (hasDefaultValue) {
      tooltip = t(
        'Default value must be set when "Filter has default value" is checked',
      );
    }
    setDefaultValueTooltip(tooltip);
  }, [hasDefaultValue, isRequired, defaultToFirstItem]);

  return [hasDefaultValue, isRequired, defaultValueTooltip, setHasDefaultValue];
};
