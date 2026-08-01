import { t } from '@zobi/core/translation';
import { styled } from '@zobi/core/theme';
import Tabs from '@zobi-ui/core/components/Tabs';
import { ResultTypes, ResultsPaneProps } from '../types';
import { useResultsPane } from './useResultsPane';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  .ant-tabs {
    height: 100%;
  }

  .ant-tabs-content {
    height: 100%;
  }

  .ant-tabs-tabpane {
    display: flex;
    flex-direction: column;
  }

  .table-condensed {
    overflow: auto;
  }
`;

export const ResultsPaneOnDashboard = ({
  isRequest,
  queryFormData,
  queryForce,
  ownState,
  errorMessage,
  setForceQuery,
  isVisible,
  dataSize = 50,
  canDownload,
  columnDisplayNames,
}: ResultsPaneProps) => {
  const resultsPanes = useResultsPane({
    errorMessage,
    queryFormData,
    queryForce,
    ownState,
    isRequest,
    setForceQuery,
    dataSize,
    isVisible,
    canDownload,
    columnDisplayNames,
  });

  if (resultsPanes.length === 1) {
    return <Wrapper>{resultsPanes[0]}</Wrapper>;
  }

  const items = resultsPanes.map((pane, idx) => ({
    key: idx === 0 ? ResultTypes.Results : `${ResultTypes.Results} ${idx + 1}`,
    label: idx === 0 ? t('Results') : t('Results %s', idx + 1),
    children: pane,
  }));

  return (
    <Wrapper>
      <Tabs items={items} />
    </Wrapper>
  );
};
