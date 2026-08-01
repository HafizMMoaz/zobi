import { ReactNode } from 'react';
import { t } from '@zobi/core/translation';
import { tn } from '@zobi/core/translation';

import type { ErrorMessageComponentProps } from './types';
import { IssueCode } from './IssueCode';
import { ErrorAlert } from './ErrorAlert';
import { CustomDocLink, CustomDocLinkProps } from './CustomDocLink';

interface DatabaseErrorExtra {
  owners?: string[];
  issue_codes: {
    code: number;
    message: string;
  }[];
  engine_name: string | null;
  custom_doc_links?: CustomDocLinkProps[];
  show_issue_info?: boolean;
}

export function DatabaseErrorMessage({
  error,
  source,
  closable,
}: ErrorMessageComponentProps<DatabaseErrorExtra | null>) {
  const { extra, level, message } = error;

  const isVisualization = ['dashboard', 'explore'].includes(source || '');
  const [firstLine, ...remainingLines] = message.split('\n');
  const alertDescription =
    remainingLines.length > 0 ? remainingLines.join('\n') : null;
  let alertMessage: ReactNode = firstLine;

  if (Array.isArray(extra?.custom_doc_links)) {
    alertMessage = (
      <>
        {firstLine}
        {extra.custom_doc_links.map(link => (
          <div key={link.url}>
            <CustomDocLink {...link} />
          </div>
        ))}
      </>
    );
  }

  const body = extra && extra.show_issue_info !== false && (
    <>
      <p>
        {t('This may be triggered by:')}
        <br />
        {extra.issue_codes?.flatMap((issueCode, idx, arr) => [
          <IssueCode {...issueCode} key={issueCode.code} />,
          idx < arr.length - 1 ? <br key={`br-${issueCode.code}`} /> : null,
        ])}
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
      errorType={t('%s Error', extra?.engine_name || t('DB engine'))}
      message={alertMessage}
      messagePre
      description={alertDescription}
      type={level}
      descriptionDetails={body}
      closable={closable}
    />
  );
}
