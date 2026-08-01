import { EventHandler, ChangeEvent, MouseEvent, ReactNode } from 'react';
import { t } from '@zobi/core/translation';
import { ZobiTheme } from '@zobi/core/theme';
import ZobiText from 'src/utils/textUtils';
import { Input, Button } from '@zobi-ui/core/components';
import { StyledInputContainer, wideButton, marginBottom } from './styles';
import { DatabaseObject } from '../types';

const SqlAlchemyTab = ({
  db,
  onInputChange,
  testConnection,
  conf,
  testInProgress = false,
  children,
}: {
  db: DatabaseObject | null;
  onInputChange: EventHandler<ChangeEvent<HTMLInputElement>>;
  testConnection: EventHandler<MouseEvent<HTMLElement>>;
  conf: { SQLALCHEMY_DOCS_URL: string; SQLALCHEMY_DISPLAY_TEXT: string };
  testInProgress?: boolean;
  children?: ReactNode;
}) => {
  const fallbackDocsUrl =
    ZobiText?.DB_MODAL_SQLALCHEMY_FORM?.SQLALCHEMY_DOCS_URL ||
    'https://docs.sqlalchemy.org/en/13/core/engines.html';
  const fallbackDisplayText =
    ZobiText?.DB_MODAL_SQLALCHEMY_FORM?.SQLALCHEMY_DISPLAY_TEXT ||
    'SQLAlchemy docs';

  return (
    <>
      <StyledInputContainer>
        <div className="control-label">
          {t('Display Name')}
          <span className="required">*</span>
        </div>
        <div className="input-container">
          <Input
            name="database_name"
            data-test="database-name-input"
            value={db?.database_name || ''}
            placeholder={t('Name your database')}
            onChange={onInputChange}
          />
        </div>
        <div className="helper">
          {t('Pick a name to help you identify this database.')}
        </div>
      </StyledInputContainer>
      <StyledInputContainer>
        <div className="control-label">
          {t('SQLAlchemy URI')}
          <span className="required">*</span>
        </div>
        <div className="input-container">
          <Input
            name="sqlalchemy_uri"
            data-test="sqlalchemy-uri-input"
            value={db?.sqlalchemy_uri || ''}
            autoComplete="off"
            placeholder={
              db?.sqlalchemy_uri_placeholder ||
              t('dialect+driver://username:password@host:port/database')
            }
            onChange={onInputChange}
          />
        </div>
        <div className="helper">
          {t('Refer to the')}{' '}
          <a
            href={fallbackDocsUrl || conf?.SQLALCHEMY_DOCS_URL || ''}
            target="_blank"
            rel="noopener noreferrer"
          >
            {fallbackDisplayText || conf?.SQLALCHEMY_DISPLAY_TEXT || ''}
          </a>{' '}
          {t('for more information on how to structure your URI.')}
        </div>
      </StyledInputContainer>
      {children}
      <Button
        onClick={testConnection}
        loading={testInProgress}
        cta
        buttonStyle="link"
        css={(theme: ZobiTheme) => [wideButton(theme), marginBottom(theme)]}
      >
        {t('Test connection')}
      </Button>
    </>
  );
};
export default SqlAlchemyTab;
