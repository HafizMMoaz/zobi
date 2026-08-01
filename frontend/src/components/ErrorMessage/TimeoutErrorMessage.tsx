import { ReactNode } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { tn } from '@zobi.dev/extension-api/translation';

import type { ErrorMessageComponentProps } from './types';
import { IssueCode } from './IssueCode';
import { ErrorAlert } from './ErrorAlert';

interface TimeoutErrorExtra {
  issue_codes: {
    code: number;
    message: string;
  }[];
  owners?: string[];
  timeout: number;
}

export function TimeoutErrorMessage({
  error,
  source,
  closable,
}: ErrorMessageComponentProps<TimeoutErrorExtra>) {
  const { extra, level } = error;

  const isVisualization = (
    ['dashboard', 'explore'] as (string | undefined)[]
  ).includes(source);

  const subtitle = isVisualization
    ? tn(
        'We’re having trouble loading this visualization. Queries are set to timeout after %s second.',
        'We’re having trouble loading this visualization. Queries are set to timeout after %s seconds.',
        extra.timeout,
        extra.timeout,
      )
    : tn(
        'We’re having trouble loading these results. Queries are set to timeout after %s second.',
        'We’re having trouble loading these results. Queries are set to timeout after %s seconds.',
        extra.timeout,
        extra.timeout,
      );

  const body = (
    <>
      <p>
        {t('This may be triggered by:')}
        <br />
        {extra.issue_codes
          .map<ReactNode>(issueCode => <IssueCode {...issueCode} />)
          .reduce((prev, curr) => [prev, <br />, curr])}
      </p>
      {isVisualization && extra.owners && (
        <>
          <br />
          <p>
            {tn(
              'Please reach out to the Chart Owner for assistance.',
              'Please reach out to the Chart Owners for assistance.',
              extra.owners.length,
            )}
          </p>
          <p>
            {tn(
              'Chart Owner: %s',
              'Chart Owners: %s',
              extra.owners.length,
              extra.owners.join(', '),
            )}
          </p>
        </>
      )}
    </>
  );

  return (
    <ErrorAlert
      errorType={t('Timeout error')}
      message={subtitle}
      type={level}
      descriptionDetails={body}
      closable={closable}
    />
  );
}
