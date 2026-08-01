import { extendedDayjs as dayjs } from '@zobi.dev/core/utils/dates';
import { Dayjs } from 'dayjs';
import { TimeRangePicker } from 'src/components/TimePicker';
import ControlHeader, { ControlHeaderProps } from '../../ControlHeader';

type TimeRangeValueType = [string, string];

export interface TimeRangeControlProps extends ControlHeaderProps {
  value?: TimeRangeValueType;
  onChange?: (value: TimeRangeValueType, errors: any) => void;
  allowClear?: boolean;
  showNow?: boolean;
  allowEmpty?: [boolean, boolean];
}

export default function TimeRangeControl({
  value: stringValue,
  onChange,
  allowClear,
  showNow,
  allowEmpty,
  ...rest
}: TimeRangeControlProps) {
  const dayjsValue: [Dayjs | null, Dayjs | null] = [
    stringValue?.[0] ? dayjs.utc(stringValue[0], 'HH:mm:ss') : null,
    stringValue?.[1] ? dayjs.utc(stringValue[1], 'HH:mm:ss') : null,
  ];

  return (
    <div>
      <ControlHeader {...rest} />
      <TimeRangePicker
        value={dayjsValue}
        onChange={(_, stringValue) => onChange?.(stringValue, null)}
        allowClear={allowClear}
        showNow={showNow}
        allowEmpty={allowEmpty}
      />
    </div>
  );
}
