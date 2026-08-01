
import { FunctionComponent } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { Alert } from '@zobi.dev/extension-api/components';
import { ZobiTheme } from '@zobi.dev/extension-api/theme';

import { getDatabaseDocumentationLinks } from 'src/views/CRUD/hooks';
import { antdWarningAlertStyles } from './styles';

const zobiTextDocs = getDatabaseDocumentationLinks();
export const DOCUMENTATION_LINK = zobiTextDocs
  ? zobiTextDocs.support
  : 'https://zobi.dev/docs/databases/installing-database-drivers';

export interface IProps {
  errorMessage: string;
  showDbInstallInstructions: boolean;
}

export const ErrorAlert: FunctionComponent<IProps> = ({
  errorMessage,
  showDbInstallInstructions,
}) => (
  <Alert
    closable={false}
    css={(theme: ZobiTheme) => antdWarningAlertStyles(theme)}
    type="error"
    showIcon
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
