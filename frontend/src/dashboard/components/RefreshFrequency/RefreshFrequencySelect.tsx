import { ChangeEvent, useEffect, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import { Input } from '@zobi.dev/core/components';
import { Radio, RadioChangeEvent } from '@zobi.dev/core/components/Radio';

// Minimum custom refresh interval in seconds
export const MINIMUM_REFRESH_INTERVAL = 1;

const StyledRadioGroup = styled(Radio.Group)`
  padding-left: ${({ theme }) => theme.sizeUnit * 2}px;

  .ant-radio-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.sizeUnit * 0.5}px;

    &:last-child {
      margin-bottom: ${({ theme }) => theme.sizeUnit}px;
    }
  }
`;

const CustomContent = styled.div`
  display: flex;
  align-items: center;

  .ant-input {
    width: 80px;
    margin-left: ${({ theme }) => theme.sizeUnit}px;
    margin-right: ${({ theme }) => theme.sizeUnit}px;
  }
`;

// Standard refresh frequency options used across modals
export const REFRESH_FREQUENCY_OPTIONS = [
  { value: 0, label: t("Don't refresh") },
  { value: 10, label: t('10 seconds') },
  { value: 30, label: t('30 seconds') },
  { value: 60, label: t('1 minute') },
  { value: 300, label: t('5 minutes') },
  { value: 1800, label: t('30 minutes') },
  { value: 3600, label: t('1 hour') },
  { value: 21600, label: t('6 hours') },
  { value: 43200, label: t('12 hours') },
  { value: 86400, label: t('24 hours') },
  { value: -1, label: t('Custom') },
];

const isPresetValue = (frequency: number) =>
  REFRESH_FREQUENCY_OPTIONS.some(
    option => option.value === frequency && option.value !== -1,
  );

const getCustomValue = (frequency: number) =>
  !isPresetValue(frequency) && frequency > 0 ? frequency.toString() : '';

const normalizeRefreshLimitSeconds = (
  refreshLimit?: number,
): number | undefined => {
  if (!refreshLimit || refreshLimit <= 0) {
    return undefined;
  }

  if (refreshLimit >= 1000 && refreshLimit % 1000 === 0) {
    return refreshLimit / 1000;
  }

  return refreshLimit;
};

interface RefreshFrequencySelectProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Shared refresh frequency select component
 * Used in both PropertiesModal and RefreshIntervalModal
 */
export const RefreshFrequencySelect = ({
  value,
  onChange,
}: RefreshFrequencySelectProps) => {
  // Separate radio selection state from value state
  const [radioSelection, setRadioSelection] = useState(() =>
    isPresetValue(value) ? value : -1,
  );

  const [customValue, setCustomValue] = useState(() => getCustomValue(value));

  useEffect(() => {
    const selection = isPresetValue(value) ? value : -1;
    setRadioSelection(selection);
    setCustomValue(selection === -1 ? getCustomValue(value) : '');
  }, [value]);

  const handleRadioChange = (event: RadioChangeEvent) => {
    const selectedValue = Number(event.target.value);
    setRadioSelection(selectedValue);

    if (selectedValue === -1) {
      // Custom selected - use current custom value or minimum
      const numValue = parseInt(customValue, 10) || MINIMUM_REFRESH_INTERVAL;
      onChange(numValue);
      if (!customValue) {
        setCustomValue(MINIMUM_REFRESH_INTERVAL.toString());
      }
    } else {
      onChange(selectedValue);
    }
  };

  const handleCustomInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setCustomValue(inputValue);

    const numValue = parseInt(inputValue, 10);
    if (numValue >= MINIMUM_REFRESH_INTERVAL) {
      onChange(numValue);
    }
  };

  return (
    <StyledRadioGroup value={radioSelection} onChange={handleRadioChange}>
      {REFRESH_FREQUENCY_OPTIONS.slice(0, -1).map(option => (
        <Radio key={option.value} value={option.value}>
          {option.label}
        </Radio>
      ))}

      <Radio value={-1}>
        <CustomContent>
          {t('Custom')}
          <Input
            type="number"
            min={MINIMUM_REFRESH_INTERVAL}
            value={customValue}
            onChange={handleCustomInputChange}
            placeholder={`${MINIMUM_REFRESH_INTERVAL}+`}
            disabled={radioSelection !== -1}
            onClick={e => e.stopPropagation()}
          />
          <span>{t('seconds')}</span>
        </CustomContent>
      </Radio>
    </StyledRadioGroup>
  );
};

/**
 * Validates refresh frequency against minimum limit
 */
export const validateRefreshFrequency = (
  frequency: number,
  refreshLimit?: number,
): string[] => {
  const errors = [];
  const normalizedLimit = normalizeRefreshLimitSeconds(refreshLimit);
  if (normalizedLimit && frequency > 0 && frequency < normalizedLimit) {
    errors.push(
      t('Refresh frequency must be at least %s seconds', normalizedLimit),
    );
  }
  return errors;
};

/**
 * Generates warning message for low refresh frequencies
 */
export const getRefreshWarningMessage = (
  frequency: number,
  refreshLimit?: number,
  refreshWarning?: string,
): string | null => {
  const normalizedLimit = normalizeRefreshLimitSeconds(refreshLimit);
  if (
    frequency > 0 &&
    normalizedLimit &&
    frequency < normalizedLimit &&
    refreshWarning
  ) {
    return refreshWarning;
  }
  return null;
};
