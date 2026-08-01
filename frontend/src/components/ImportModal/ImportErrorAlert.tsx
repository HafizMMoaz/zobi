
import { FunctionComponent } from 'react';
import { t } from '@zobi.dev/extension-api/translation';

import { getDatabaseDocumentationLinks } from 'src/views/CRUD/hooks';
import { ErrorAlert } from 'src/components';

const zobiTextDocs = getDatabaseDocumentationLinks();
export const DOCUMENTATION_LINK = zobiTextDocs
  ? zobiTextDocs.support
  : 'https://zobi.dev/docs/databases/installing-database-drivers';

export interface IProps {
  errorMessage: string;
  showDbInstallInstructions: boolean;
}

export const ImportErrorAlert: FunctionComponent<IProps> = ({
  errorMessage,
  showDbInstallInstructions,
}) => (
  <ErrorAlert
    type="error"
    errorType={t('Import Error')}
    message={errorMessage}
    description={
      showDbInstallInstructions ? (
        <>
          <br />
          {t(
            'Database driver for importing maybe not installed. Visit the Zobi documentation page for installation instructions: ',
          )}
          <a
            href={DOCUMENTATION_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="additional-fields-alert-description"
          >
            {t('here')}
          </a>
          .
        </>
      ) : (
        ''
      )
    }
  />
);
