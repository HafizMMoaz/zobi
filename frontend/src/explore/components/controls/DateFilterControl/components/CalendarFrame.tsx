import { useEffect } from 'react';
import { t } from '@zobi/core/translation';
import { Radio } from '@zobi-ui/core/components/Radio';
import {
  CALENDAR_RANGE_OPTIONS,
  CALENDAR_RANGE_SET,
} from 'src/explore/components/controls/DateFilterControl/utils';
import {
  CalendarRangeType,
  PreviousCalendarWeek,
  FrameComponentProps,
} from '../types';

export function CalendarFrame({ onChange, value }: FrameComponentProps) {
  useEffect(() => {
    if (!CALENDAR_RANGE_SET.has(value as CalendarRangeType)) {
      onChange(PreviousCalendarWeek);
    }
  }, [onChange, value]);

  if (!CALENDAR_RANGE_SET.has(value as CalendarRangeType)) {
    return null;
  }

  return (
    <>
      <div className="section-title">
        {t('Configure Time Range: Previous...')}
      </div>
      <Radio.GroupWrapper
        spaceConfig={{
          direction: 'vertical',
          size: 15,
          align: 'start',
          wrap: false,
        }}
        size="large"
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        options={CALENDAR_RANGE_OPTIONS}
      />
    </>
  );
}
