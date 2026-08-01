import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { t } from '@zobi/core/translation';
import { Alert } from '@zobi/core/components';
import { css, styled } from '@zobi/core/theme';

import {
  Button,
  Loading,
  ModalTrigger,
  TableView,
  EmptyWrapperType,
  Icons,
} from '@zobi-ui/core/components';
import useQueryEditor from 'src/SqlLab/hooks/useQueryEditor';
import { SqlLabRootState, QueryCostEstimate } from 'src/SqlLab/types';

export interface EstimateQueryCostButtonProps {
  getEstimate: Function;
  queryEditorId: string;
  tooltip?: string;
  disabled?: boolean;
}

const CostEstimateModalStyles = styled.div`
  ${({ theme }) => css`
    font-size: ${theme.fontSizeSM};
  `}
`;

const EstimateQueryCostButton = ({
  getEstimate,
  queryEditorId,
  tooltip = '',
  disabled = false,
}: EstimateQueryCostButtonProps) => {
  const queryCostEstimate = useSelector<
    SqlLabRootState,
    QueryCostEstimate | undefined
  >(state => state.sqlLab.queryCostEstimates?.[queryEditorId]);

  const { selectedText } = useQueryEditor(queryEditorId, ['selectedText']);
  const { cost } = queryCostEstimate || {};
  const tableData = useMemo(() => (Array.isArray(cost) ? cost : []), [cost]);
  const columns = useMemo(
    () =>
      Array.isArray(cost) && cost.length
        ? Object.keys(cost[0]).map(key => ({
            accessor: key,
            Header: key,
            id: key,
          }))
        : [],
    [cost],
  );

  // A call back method to pass an event handler function as a prop to the Button element.
  // Refer: https://reactjs.org/docs/handling-events.html
  const onClickHandler = () => {
    getEstimate();
  };

  const renderModalBody = () => {
    if (queryCostEstimate?.error) {
      return (
        <Alert
          key="query-estimate-error"
          type="error"
          message={queryCostEstimate?.error}
        />
      );
    }
    if (queryCostEstimate?.completed) {
      return (
        <CostEstimateModalStyles>
          <TableView
            columns={columns}
            data={tableData}
            withPagination={false}
            emptyWrapperType={EmptyWrapperType.Small}
          />
        </CostEstimateModalStyles>
      );
    }
    return <Loading position="normal" />;
  };

  const btnText = selectedText
    ? t('Estimate selected query cost')
    : t('Estimate cost');
  return (
    <span className="EstimateQueryCostButton">
      <ModalTrigger
        modalTitle={t('Cost estimate')}
        modalBody={renderModalBody()}
        triggerNode={
          <Button
            color="default"
            variant="text"
            style={{ height: 32, padding: '4px 15px' }}
            onClick={onClickHandler}
            key="query-estimate-btn"
            tooltip={tooltip}
            disabled={disabled}
            icon={<Icons.MonitorOutlined iconSize="m" />}
            aria-label={btnText}
          />
        }
      />
    </span>
  );
};

export default EstimateQueryCostButton;
