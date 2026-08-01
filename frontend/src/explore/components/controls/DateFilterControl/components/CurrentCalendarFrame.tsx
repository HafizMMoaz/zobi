import { useEffect } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { Radio } from '@zobi.dev/core/components/Radio';
import {
  CURRENT_RANGE_OPTIONS,
  CURRENT_CALENDAR_RANGE_SET,
} from 'src/explore/components/controls/DateFilterControl/utils';
import { CurrentRangeType, CurrentWeek, FrameComponentProps } from '../types';

export function CurrentCalendarFrame({ onChange, value }: FrameComponentProps) {
  useEffect(() => {
    if (!CURRENT_CALENDAR_RANGE_SET.has(value as CurrentRangeType)) {
      onChange(CurrentWeek);
    }
  }, [value]);

  if (!CURRENT_CALENDAR_RANGE_SET.has(value as CurrentRangeType)) {
    return null;
  }

  return (
    <>
      <div className="section-title">
        {t('Configure Time Range: Current...')}
      </div>
      <Radio.GroupWrapper
        spaceConfig={{
          direction: 'vertical',
          size: 15,
          align: 'start',
          wrap: true,
        }}
        size="large"
        onChange={(e: any) => {
          let newValue = e.target.value;
          newValue = newValue.trim();
          if (newValue === '') return;
          onChange(newValue);
        }}
        options={CURRENT_RANGE_OPTIONS}
      />
    </>
  );
}
