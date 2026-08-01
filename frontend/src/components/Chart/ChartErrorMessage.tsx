
import { ClientErrorObject, ZobiError } from '@zobi.dev/core';
import { FC } from 'react';
import { useChartOwnerNames } from 'src/hooks/apiResources';
import { ErrorMessageWithStackTrace } from 'src/components';
import { ChartSource } from 'src/types/ChartSource';

export type Props = {
  chartId: number;
  error?: ZobiError;
  subtitle: React.ReactNode;
  link?: string;
  source: ChartSource;
  stackTrace?: string;
} & Omit<ClientErrorObject, 'error'>;

const DEFAULT_CHART_ERROR = 'Data error';

export const ChartErrorMessage: FC<Props> = ({ chartId, error, ...props }) => {
  // fetches the chart owners and adds them to the extra data of the error message
  const { result: owners } = useChartOwnerNames(chartId);

  // don't mutate props
  const ownedError = error && {
    ...error,
    extra: { ...error.extra, owners },
  };

  return (
    <ErrorMessageWithStackTrace
      {...props}
      error={ownedError}
      title={DEFAULT_CHART_ERROR}
      closable={false}
    />
  );
};
