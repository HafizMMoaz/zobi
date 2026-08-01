import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import useGetDatasetRelatedCounts from 'src/features/datasets/hooks/useGetDatasetRelatedCounts';
import { Badge } from '@zobi.dev/core/components';
import Tabs from '@zobi.dev/core/components/Tabs';

const StyledTabs = styled(Tabs)`
  ${({ theme }) => `
  margin-top: ${theme.sizeUnit * 8.5}px;
  padding-left: ${theme.sizeUnit * 4}px;
  padding-right: ${theme.sizeUnit * 4}px;

  .ant-tabs-top > .ant-tabs-nav::before {
    width: ${theme.sizeUnit * 50}px;
  }
  `}
`;

const TabStyles = styled.div`
  ${({ theme }) => `
  .ant-badge {
    width: ${theme.sizeUnit * 8}px;
    margin-left: ${theme.sizeUnit * 2.5}px;
  }
  `}
`;

interface EditPageProps {
  id: string;
}

const TRANSLATIONS = {
  USAGE_TEXT: t('Usage'),
  COLUMNS_TEXT: t('Columns'),
  METRICS_TEXT: t('Metrics'),
};

const TABS_KEYS = {
  COLUMNS: 'COLUMNS',
  METRICS: 'METRICS',
  USAGE: 'USAGE',
};

const EditPage = ({ id }: EditPageProps) => {
  const { usageCount } = useGetDatasetRelatedCounts(id);

  const usageTab = (
    <TabStyles>
      <span>{TRANSLATIONS.USAGE_TEXT}</span>
      {usageCount > 0 && <Badge count={usageCount} />}
    </TabStyles>
  );

  const items = [
    {
      key: TABS_KEYS.COLUMNS,
      label: TRANSLATIONS.COLUMNS_TEXT,
      children: null,
    },
    {
      key: TABS_KEYS.METRICS,
      label: TRANSLATIONS.METRICS_TEXT,
      children: null,
    },
    {
      key: TABS_KEYS.USAGE,
      label: usageTab,
      children: null,
    },
  ];

  return <StyledTabs moreIcon={null} items={items} />;
};

export default EditPage;
