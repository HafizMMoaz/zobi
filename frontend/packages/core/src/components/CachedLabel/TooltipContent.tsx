import { FC } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { extendedDayjs } from '../../utils/dates';

interface Props {
  cachedTimestamp?: string;
}
export const TooltipContent: FC<Props> = ({ cachedTimestamp }) => {
  const cachedText = cachedTimestamp ? (
    <span>
      {t('Loaded data cached')}
      <b> {extendedDayjs.utc(cachedTimestamp).fromNow()}</b>
    </span>
  ) : (
    t('Loaded from cache')
  );

  return (
    <span data-test="tooltip-content">
      {cachedText}. {t('Click to force-refresh')}
    </span>
  );
};
