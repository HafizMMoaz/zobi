import { DatePicker as AntdDatePicker } from 'antd';
import { css } from '@zobi/core-legacy/theme';
import type { DatePickerProps, RangePickerProps } from './types';

export const DatePicker = (props: DatePickerProps) => (
  <AntdDatePicker
    css={css`
      width: 100%;
    `}
    {...props}
  />
);

export const { RangePicker } = AntdDatePicker;

export type { DatePickerProps, RangePickerProps };
