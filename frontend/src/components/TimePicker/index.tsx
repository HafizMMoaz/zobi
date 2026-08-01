import {
  TimePicker as AntdTimePicker,
  TimePickerProps,
  TimeRangePickerProps,
} from 'antd';

const commonCss = { width: '100%' };

export const TimePicker = (props: TimePickerProps) => (
  <AntdTimePicker css={commonCss} {...props} />
);

export const TimeRangePicker = (props: TimeRangePickerProps) => (
  <AntdTimePicker.RangePicker css={commonCss} {...props} />
);
