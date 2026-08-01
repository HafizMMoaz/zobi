import { useState } from 'react';
import { t } from '@zobi/core/translation';
import { useTheme, styled } from '@zobi/core/theme';
import cx from 'classnames';
import { Button, Modal } from '@zobi-ui/core/components';
import withToasts, {
  ToastProps,
} from 'src/components/MessageToasts/withToasts';
import SyntaxHighlighterCopy from 'src/features/queries/SyntaxHighlighterCopy';
import useQueryPreviewState from 'src/features/queries/hooks/useQueryPreviewState';
import { QueryObject } from 'src/views/CRUD/types';

const QueryTitle = styled.div`
  color: ${({ theme }) => theme.colorTextSecondary};
  font-size: ${({ theme }) => theme.fontSizeSM}px;
  margin-bottom: 0;
`;

const QueryLabel = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${({ theme }) => theme.fontSize}px;
  padding: 4px 0 24px 0;
`;

const QueryViewToggle = styled.div`
  display: flex;
`;

const TabButton = styled.div`
  font-size: ${({ theme }) => theme.fontSizeSM}px;
  padding: ${({ theme }) => theme.sizeUnit * 2}px
    ${({ theme }) => theme.sizeUnit * 4}px;
  margin-right: ${({ theme }) => theme.sizeUnit * 4}px;
  color: ${({ theme }) => theme.colorPrimaryText};

  &.active,
  &:focus,
  &:hover {
    background: ${({ theme }) => theme.colorPrimaryBg};
    border-radius: ${({ theme }) => theme.borderRadius}px;
  }

  &:hover:not(.active) {
    background: ${({ theme }) => theme.colorPrimaryBgHover};
  }
`;
const StyledModal = styled(Modal)`
  .ant-modal-body {
    padding: ${({ theme }) => theme.sizeUnit * 6}px;
    padding-top: 0;
  }
`;

interface QueryPreviewModalProps extends ToastProps {
  onHide: () => void;
  openInSqlLab: (id: number) => any;
  queries: QueryObject[];
  query: QueryObject;
  fetchData: (id: number) => any;
  show: boolean;
}

function QueryPreviewModal({
  onHide,
  openInSqlLab,
  queries,
  query,
  fetchData,
  show,
  addDangerToast,
  addSuccessToast,
}: QueryPreviewModalProps) {
  const { handleKeyPress, handleDataChange, disablePrevious, disableNext } =
    useQueryPreviewState<QueryObject>({
      queries,
      currentQueryId: query.id,
      fetchData,
    });
  const theme = useTheme();
  const codeBlockStyle = {
    border: 1,
    borderColor: theme.colorBorder,
    borderStyle: 'solid',
    marginTop: theme.sizeUnit * 4,
    fontSize: theme.fontSize * 0.75,
    height: theme.sizeUnit * 100,
  };

  const [currentTab, setCurrentTab] = useState<'user' | 'executed'>('user');

  const { id, sql, executed_sql } = query;
  return (
    <div role="none" onKeyUp={handleKeyPress}>
      <StyledModal
        onHide={onHide}
        show={show}
        title={t('Query preview')}
        footer={
          <>
            <Button
              data-test="previous-query"
              key="previous-query"
              buttonStyle="secondary"
              disabled={disablePrevious}
              onClick={() => handleDataChange(true)}
            >
              {t('Previous')}
            </Button>
            <Button
              data-test="next-query"
              key="next-query"
              buttonStyle="secondary"
              disabled={disableNext}
              onClick={() => handleDataChange(false)}
            >
              {t('Next')}
            </Button>
            <Button
              data-test="open-in-sql-lab"
              key="open-in-sql-lab"
              onClick={() => openInSqlLab(id)}
            >
              {t('Open in SQL Lab')}
            </Button>
          </>
        }
      >
        <QueryTitle>{t('Tab name')}</QueryTitle>
        <QueryLabel>{query.tab_name}</QueryLabel>
        <QueryViewToggle>
          <TabButton
            role="button"
            data-test="toggle-user-sql"
            className={cx({ active: currentTab === 'user' })}
            onClick={() => setCurrentTab('user')}
          >
            {t('User query')}
          </TabButton>
          <TabButton
            role="button"
            data-test="toggle-executed-sql"
            className={cx({ active: currentTab === 'executed' })}
            onClick={() => setCurrentTab('executed')}
          >
            {t('Executed query')}
          </TabButton>
        </QueryViewToggle>
        <SyntaxHighlighterCopy
          addDangerToast={addDangerToast}
          addSuccessToast={addSuccessToast}
          language="sql"
          customStyle={codeBlockStyle}
        >
          {(currentTab === 'user' ? sql : executed_sql) || ''}
        </SyntaxHighlighterCopy>
      </StyledModal>
    </div>
  );
}

export default withToasts(QueryPreviewModal);
