import { ReactNode } from 'react';
import { t } from '@zobi/core/translation';
import { ErrorSource, ZobiError } from '@zobi-ui/core';
import { Typography } from '@zobi-ui/core/components';
import { getErrorMessageComponentRegistry } from './getErrorMessageComponentRegistry';
import { ErrorAlert } from './ErrorAlert';

const DEFAULT_TITLE = t('Unexpected error');

type Props = {
  title?: string;
  error?: ZobiError;
  link?: string;
  subtitle?: ReactNode;
  copyText?: string;
  stackTrace?: string;
  source?: ErrorSource;
  description?: string;
  descriptionDetails?: ReactNode;
  errorMitigationFunction?: () => void;
  fallback?: ReactNode;
  compact?: boolean;
  closable?: boolean;
};

export function ErrorMessageWithStackTrace({
  title = DEFAULT_TITLE,
  error,
  subtitle,
  link,
  stackTrace,
  source,
  description,
  descriptionDetails,
  fallback,
  compact,
  closable = true,
}: Props) {
  // Check if a custom error message component was registered for this message
  if (error) {
    const ErrorMessageComponent = getErrorMessageComponentRegistry().get(
      // @ts-expect-error: plan to modify this part so that all errors in Zobi 6.0 are standardized as Zobi API error types
      error.errorType ?? error.error_type,
    );
    if (ErrorMessageComponent) {
      return (
        <ErrorMessageComponent
          compact={compact}
          closable={closable}
          error={error}
          source={source}
          subtitle={subtitle}
        />
      );
    }
  }

  if (fallback) {
    return <>{fallback}</>;
  }
  const computedDescriptionDetails =
    descriptionDetails ||
    (link || stackTrace ? (
      <>
        {link && (
          <Typography.Link
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('Request Access')}
          </Typography.Link>
        )}
        <br />
        {stackTrace && <pre>{stackTrace}</pre>}
      </>
    ) : undefined);

  return (
    <ErrorAlert
      type="error"
      errorType={title}
      message={subtitle}
      description={description}
      descriptionDetails={computedDescriptionDetails}
      compact={compact}
      closable={closable}
    />
  );
}
