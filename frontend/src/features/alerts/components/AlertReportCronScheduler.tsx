import { useState, useCallback, FocusEvent, FC } from 'react';

import { t } from '@zobi/core/translation';
import { useTheme } from '@zobi/core/theme';

import {
  Input,
  CronPicker,
  Select,
  type CronError,
} from '@zobi-ui/core/components';
import { StyledInputContainer } from '../AlertReportModal';

export interface AlertReportCronSchedulerProps {
  value: string;
  onChange: (change: string) => any;
}

enum ScheduleType {
  Picker = 'picker',
  Input = 'input',
}

const SCHEDULE_TYPE_OPTIONS = [
  {
    label: t('Recurring (every)'),
    value: ScheduleType.Picker,
  },
  {
    label: t('CRON Schedule'),
    value: ScheduleType.Input,
  },
];

export const AlertReportCronScheduler: FC<AlertReportCronSchedulerProps> = ({
  value,
  onChange,
}) => {
  const theme = useTheme();
  const [scheduleFormat, setScheduleFormat] = useState<ScheduleType>(
    ScheduleType.Picker,
  );

  const customSetValue = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  const handlePressEnter = useCallback(() => {
    onChange(value || '');
  }, [onChange, value]);

  const [error, onError] = useState<CronError>();

  return (
    <>
      <StyledInputContainer>
        <div className="control-label">
          {t('Schedule type')}
          <span className="required">*</span>
        </div>
        <div className="input-container">
          <Select
            ariaLabel={t('Schedule type')}
            placeholder={t('Schedule type')}
            onChange={(e: ScheduleType) => {
              setScheduleFormat(e);
            }}
            value={scheduleFormat}
            options={SCHEDULE_TYPE_OPTIONS}
          />
        </div>
      </StyledInputContainer>

      <StyledInputContainer data-test="input-content" className="styled-input">
        <div className="control-label">
          {t('Schedule')}
          <span className="required">*</span>
        </div>
        {scheduleFormat === ScheduleType.Input && (
          <Input
            type="text"
            name="crontab"
            style={error ? { borderColor: theme.colorError } : {}}
            placeholder={t('CRON expression')}
            value={value}
            onBlur={handleBlur}
            onChange={e => customSetValue(e.target.value)}
            onPressEnter={handlePressEnter}
          />
        )}
        {scheduleFormat === ScheduleType.Picker && (
          <CronPicker
            clearButton={false}
            value={value}
            setValue={customSetValue}
            displayError={scheduleFormat === ScheduleType.Picker}
            onError={onError}
          />
        )}
      </StyledInputContainer>
    </>
  );
};
