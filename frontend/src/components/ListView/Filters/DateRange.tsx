import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react';

import { t } from '@zobi.dev/extension-api/translation';
import { Dayjs } from 'dayjs';
import { useLocale } from 'src/hooks/useLocale';
import { extendedDayjs } from '@zobi.dev/core/utils/dates';
import {
  AntdThemeProvider,
  Loading,
  FormLabel,
  RangePicker,
} from '@zobi.dev/core/components';
import type { BaseFilter, FilterHandler } from './types';
import { FilterContainer } from './Base';
import { RANGE_WIDTH } from '../utils';

interface DateRangeFilterProps extends BaseFilter {
  onSubmit: (val: number[] | string[]) => void;
  name: string;
  dateFilterValueType?: 'unix' | 'iso';
}

type ValueState = [number, number] | [string, string] | null;

function DateRangeFilter(
  {
    Header,
    initialValue,
    onSubmit,
    dateFilterValueType = 'unix',
  }: DateRangeFilterProps,
  ref: ForwardedRef<FilterHandler>,
) {
  const [value, setValue] = useState<ValueState | null>(initialValue ?? null);
  const dayjsValue = useMemo((): [Dayjs, Dayjs] | null => {
    if (!value || (Array.isArray(value) && !value.length)) return null;
    return [extendedDayjs(value[0]), extendedDayjs(value[1])];
  }, [value]);

  const locale = useLocale();

  useImperativeHandle(ref, () => ({
    clearFilter: () => {
      setValue(null);
      onSubmit([]);
    },
  }));

  if (locale === null) {
    return <Loading position="inline-centered" />;
  }
  return (
    <AntdThemeProvider locale={locale}>
      <FilterContainer
        data-test="date-range-filter-container"
        vertical
        justify="center"
        align="start"
        width={RANGE_WIDTH}
      >
        <FormLabel>{Header}</FormLabel>
        <RangePicker
          placeholder={[t('Start date'), t('End date')]}
          showTime
          value={dayjsValue}
          onCalendarChange={(dayjsRange: [Dayjs, Dayjs]) => {
            if (!dayjsRange?.[0]?.valueOf() || !dayjsRange?.[1]?.valueOf()) {
              setValue(null);
              onSubmit([]);
              return;
            }
            const changeValue =
              dateFilterValueType === 'iso'
                ? [dayjsRange[0].toISOString(), dayjsRange[1].toISOString()]
                : [
                    dayjsRange[0]?.valueOf() ?? 0,
                    dayjsRange[1]?.valueOf() ?? 0,
                  ];
            setValue(changeValue as ValueState);
            onSubmit(changeValue);
          }}
        />
      </FilterContainer>
    </AntdThemeProvider>
  );
}

export default forwardRef(DateRangeFilter);
