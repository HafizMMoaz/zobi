import { ReactElement } from 'react';

import { t } from '@zobi.dev/extension-api/translation';
import { getExtensionsRegistry } from '@zobi.dev/core';
import { Dataset, isTemporalColumn } from '@zobi.dev/chart-controls';
import DateFilterControl from 'src/explore/components/controls/DateFilterControl/DateFilterLabel';
import ControlHeader from 'src/explore/components/ControlHeader';

interface DatePickerInFilterProps {
  columnName?: string;
  timeRange?: string;
  datasource: Dataset;
  onChange: (columnName: string, timeRange: string) => void;
}

export const useDatePickerInAdhocFilter = ({
  columnName,
  timeRange,
  datasource,
  onChange,
}: DatePickerInFilterProps): ReactElement | undefined => {
  const onTimeRangeChange = (val: string) => onChange(columnName ?? '', val);

  const extensionsRegistry = getExtensionsRegistry();

  const DateFilterControlExtension = extensionsRegistry.get(
    'filter.dateFilterControl',
  );
  const DateFilterComponent = DateFilterControlExtension ?? DateFilterControl;

  return columnName && isTemporalColumn(columnName, datasource) ? (
    <>
      <ControlHeader label={t('Time Range')} />
      <DateFilterComponent
        value={timeRange}
        name="time_range"
        onChange={onTimeRangeChange}
      />
    </>
  ) : undefined;
};
