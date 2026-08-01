
import { t } from '@zobi.dev/extension-api/translation';
import { getDatabaseDocumentationLinks } from 'src/views/CRUD/hooks';
import { UploadFile } from '@zobi.dev/core/components/Upload';
import { Typography } from '@zobi.dev/core/components/Typography';
import { DatabaseForm, DatabaseObject } from '../types';
import {
  EditHeaderTitle,
  EditHeaderSubtitle,
  StyledFormHeader,
  StyledStickyHeader,
} from './styles';

const zobiTextDocs = getDatabaseDocumentationLinks();

export const DOCUMENTATION_LINK = zobiTextDocs
  ? zobiTextDocs.support
  : 'https://zobi.dev/user-docs/databases/#installing-database-drivers';

const irregularDocumentationLinks = {
  postgresql: 'https://zobi.dev',
  mssql:
    'https://zobi.dev/user-docs/databases/supported/microsoft-sql-server',
  gsheets:
    'https://zobi.dev/user-docs/databases/supported/google-sheets',
};

const documentationLink = (engine: string | undefined) => {
  if (!engine) return null;

  if (zobiTextDocs) {
    // override doc link for zobi_txt yml
    return zobiTextDocs[engine] || zobiTextDocs.default;
  }

  if (
    !irregularDocumentationLinks[
      engine as keyof typeof irregularDocumentationLinks
    ]
  ) {
    return `https://zobi.dev/docs/databases/${engine}`;
  }
  return irregularDocumentationLinks[
    engine as keyof typeof irregularDocumentationLinks
  ];
};

const ModalHeader = ({
  isLoading,
  isEditMode,
  useSqlAlchemyForm,
  hasConnectedDb,
  db,
  dbName,
  dbModel,
  editNewDb,
  fileList,
}: {
  isLoading: boolean;
  isEditMode: boolean;
  useSqlAlchemyForm: boolean;
  hasConnectedDb: boolean;
  db: Partial<DatabaseObject> | null;
  dbName: string;
  dbModel: DatabaseForm;
  editNewDb?: boolean;
  fileList?: UploadFile[];
  passwordFields?: string[];
  needsOverwriteConfirm?: boolean;
}) => {
  const fileCheck = fileList && fileList?.length > 0;

  const isEditHeader = (
    <StyledFormHeader>
      <EditHeaderTitle>{db?.backend}</EditHeaderTitle>
      <EditHeaderSubtitle>{dbName}</EditHeaderSubtitle>
    </StyledFormHeader>
  );

  const useSqlAlchemyFormHeader = (
    <StyledFormHeader>
      <p className="helper-top">
        {t('STEP %(stepCurr)s OF %(stepLast)s', {
          stepCurr: 2,
          stepLast: 2,
        })}
      </p>
      <Typography.Title level={4}>
        {t('Enter Primary Credentials')}
      </Typography.Title>
      <p className="helper-bottom">
        {t('Need help? Learn how to connect your database')}{' '}
        <a
          href={zobiTextDocs?.default || DOCUMENTATION_LINK}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('here')}
        </a>
        .
      </p>
    </StyledFormHeader>
  );

  const hasConnectedDbHeader = (
    <StyledStickyHeader>
      <StyledFormHeader>
        <p className="helper-top">
          {t('STEP %(stepCurr)s OF %(stepLast)s', {
            stepCurr: 3,
            stepLast: 3,
          })}
        </p>
        <Typography.Title level={4} className="step-3-text">
          {t('Database connected')}
        </Typography.Title>
        <p className="subheader-text">
          {t(`Create a dataset to begin visualizing your data as a chart or go to
          SQL Lab to query your data.`)}
        </p>
      </StyledFormHeader>
    </StyledStickyHeader>
  );

  const hasDbHeader = (
    <StyledStickyHeader>
      <StyledFormHeader>
        <p className="helper-top">
          {t('STEP %(stepCurr)s OF %(stepLast)s', {
            stepCurr: 2,
            stepLast: 3,
          })}
        </p>
        <Typography.Title level={4}>
          {t('Enter the required %(dbModelName)s credentials', {
            dbModelName: dbModel.name,
          })}
        </Typography.Title>
        <p className="helper-bottom">
          {t('Need help? Learn more about')}{' '}
          <a
            href={documentationLink(db?.engine)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('connecting to %(dbModelName)s', { dbModelName: dbModel.name })}.
          </a>
        </p>
      </StyledFormHeader>
    </StyledStickyHeader>
  );

  const noDbHeader = (
    <StyledStickyHeader>
      <StyledFormHeader>
        <div className="select-db">
          <p className="helper-top">
            {t('STEP %(stepCurr)s OF %(stepLast)s', {
              stepCurr: 1,
              stepLast: 3,
            })}
          </p>
          <Typography.Title level={4}>
            {t('Select a database to connect')}
          </Typography.Title>
        </div>
      </StyledFormHeader>
    </StyledStickyHeader>
  );

  const importDbHeader = (
    <StyledStickyHeader>
      <StyledFormHeader>
        <p className="helper-top">
          {t('STEP %(stepCurr)s OF %(stepLast)s', {
            stepCurr: 2,
            stepLast: 2,
          })}
        </p>
        <Typography.Title level={4}>
          {t('Enter the required %(dbModelName)s credentials', {
            dbModelName: dbModel.name,
          })}
        </Typography.Title>
        <p className="helper-bottom">{fileCheck ? fileList[0].name : ''}</p>
      </StyledFormHeader>
    </StyledStickyHeader>
  );

  if (fileCheck) return importDbHeader;
  if (isLoading) return <></>;
  if (isEditMode) return isEditHeader;
  if (useSqlAlchemyForm) return useSqlAlchemyFormHeader;
  if (hasConnectedDb && !editNewDb) return hasConnectedDbHeader;
  if (db || editNewDb) return hasDbHeader;

  return noDbHeader;
};

export default ModalHeader;
