import { t } from '@zobi/core/translation';

import type { ErrorMessageComponentProps } from './types';
import { ErrorAlert } from './ErrorAlert';

export function FrontendNetworkErrorMessage({
  error,
  subtitle,
  compact,
  closable,
}: ErrorMessageComponentProps) {
  const { level, message } = error;
  return (
    <ErrorAlert
      compact={compact}
      closable={closable}
      errorType={t('Network Error')}
      message={message}
      type={level}
    />
  );
}
