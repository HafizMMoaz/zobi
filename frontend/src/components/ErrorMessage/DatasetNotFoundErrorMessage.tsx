import { t } from '@zobi.dev/extension-api/translation';

import type { ErrorMessageComponentProps } from './types';
import { ErrorAlert } from './ErrorAlert';
import { datasetLabelLower } from 'src/features/semanticLayers/label';

export function DatasetNotFoundErrorMessage({
  error,
  subtitle,
  closable,
}: ErrorMessageComponentProps) {
  const { level, message } = error;
  return (
    <ErrorAlert
      errorType={t('Missing %s', datasetLabelLower())}
      message={subtitle}
      description={message}
      type={level}
      closable={closable}
    />
  );
}
