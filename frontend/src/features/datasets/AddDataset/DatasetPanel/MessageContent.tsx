
import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import { EmptyState } from '@zobi.dev/core/components';
import { Link } from 'react-router-dom';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.sizeUnit * 8}px
    ${({ theme }) => theme.sizeUnit * 6}px;

  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const StyledEmptyState = styled(EmptyState)`
  max-width: 50%;

  p {
    width: ${({ theme }) => theme.sizeUnit * 115}px;
  }
`;

export const SELECT_MESSAGE = t(
  'Datasets can be created from database tables or SQL queries. Select a database table to the left or ',
);
export const CREATE_MESSAGE = t('create dataset from SQL query');
export const VIEW_DATASET_MESSAGE = t(
  ' to open SQL Lab. From there you can save the query as a dataset.',
);

const renderEmptyDescription = () => (
  <>
    {SELECT_MESSAGE}
    <Link to="/sqllab">
      <span role="button" tabIndex={0}>
        {CREATE_MESSAGE}
      </span>
    </Link>
    {VIEW_DATASET_MESSAGE}
  </>
);

export const SELECT_TABLE_TITLE = t('Select dataset source');
export const NO_COLUMNS_TITLE = t('No table columns');
export const NO_COLUMNS_DESCRIPTION = t(
  'This database table does not contain any data. Please select a different table.',
);
export const ERROR_TITLE = t('An Error Occurred');
export const ERROR_DESCRIPTION = t(
  'Unable to load columns for the selected table. Please select a different table.',
);

interface MessageContentProps {
  hasError: boolean;
  tableName?: string | null;
  hasColumns: boolean;
}

export const MessageContent = (props: MessageContentProps) => {
  const { hasError, tableName, hasColumns } = props;
  let currentImage: string | undefined = 'empty-dataset.svg';
  let currentTitle = SELECT_TABLE_TITLE;
  let currentDescription = renderEmptyDescription();
  if (hasError) {
    currentTitle = ERROR_TITLE;
    currentDescription = <>{ERROR_DESCRIPTION}</>;
    currentImage = undefined;
  } else if (tableName && !hasColumns) {
    currentImage = 'no-columns.svg';
    currentTitle = NO_COLUMNS_TITLE;
    currentDescription = <>{NO_COLUMNS_DESCRIPTION}</>;
  }
  return (
    <StyledContainer>
      <StyledEmptyState
        image={currentImage}
        size="medium"
        textSize="large"
        title={currentTitle}
        description={currentDescription}
      />
    </StyledContainer>
  );
};

export default MessageContent;
