
import { ReactNode } from 'react';
import { t } from '@zobi/core/translation';
import { useTheme } from '@zobi/core/theme';
import { Button } from '@zobi-ui/core/components';
import { Icons } from '@zobi-ui/core/components/Icons';

export type RunQueryButtonProps = {
  loading: boolean;
  onQuery: () => void;
  onStop: () => void;
  errorMessage: ReactNode;
  isNewChart: boolean;
  canStopQuery: boolean;
  chartIsStale: boolean;
};

export const RunQueryButton = ({
  loading,
  onQuery,
  onStop,
  errorMessage,
  isNewChart,
  canStopQuery,
  chartIsStale,
}: RunQueryButtonProps) => {
  const theme = useTheme();
  return loading ? (
    <Button onClick={onStop} buttonStyle="danger" disabled={!canStopQuery}>
      <Icons.Square iconSize="xs" iconColor={theme.colorIcon} />
      {t('Stop')}
    </Button>
  ) : (
    <Button
      onClick={onQuery}
      buttonStyle={chartIsStale ? 'primary' : 'secondary'}
      disabled={!!errorMessage}
      data-test="run-query-button"
    >
      {isNewChart ? t('Create chart') : t('Update chart')}
    </Button>
  );
};
