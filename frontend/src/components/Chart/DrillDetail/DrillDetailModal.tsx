
import { useCallback, useContext, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { t } from '@zobi/core/translation';
import {
  BinaryQueryObjectFilterClause,
  QueryFormData,
} from '@zobi-ui/core';
import { css, useTheme } from '@zobi/core/theme';
import { Button, Modal } from '@zobi-ui/core/components';
import { useSelector } from 'react-redux';
import { DashboardPageIdContext } from 'src/dashboard/containers/DashboardPage';
import { isEmbedded } from 'src/dashboard/util/isEmbedded';
import { Slice } from 'src/types/Chart';
import { RootState } from 'src/dashboard/types';
import { findPermission } from 'src/utils/findPermission';
import { Dataset } from '../types';
import DrillDetailPane from './DrillDetailPane';

interface ModalFooterProps {
  canExplore: boolean;
  closeModal?: () => void;
  exploreChart: () => void;
}

const ModalFooter = ({
  canExplore,
  closeModal,
  exploreChart,
}: ModalFooterProps) => {
  const theme = useTheme();

  return (
    <>
      {!isEmbedded() && (
        <Button
          buttonStyle="secondary"
          buttonSize="small"
          onClick={exploreChart}
          disabled={!canExplore}
          tooltip={
            !canExplore
              ? t('You do not have sufficient permissions to edit the chart')
              : undefined
          }
        >
          {t('Edit chart')}
        </Button>
      )}
      <Button
        buttonStyle="primary"
        buttonSize="small"
        onClick={closeModal}
        data-test="close-drilltodetail-modal"
        css={css`
          margin-left: ${theme.sizeUnit * 2}px;
        `}
      >
        {t('Close')}
      </Button>
    </>
  );
};

interface DrillDetailModalProps {
  chartId: number;
  formData: QueryFormData;
  initialFilters: BinaryQueryObjectFilterClause[];
  showModal: boolean;
  onHideModal: () => void;
  dataset?: Dataset;
}

export default function DrillDetailModal({
  chartId,
  formData,
  initialFilters,
  showModal,
  onHideModal,
  dataset,
}: DrillDetailModalProps) {
  const theme = useTheme();
  const history = useHistory();
  const dashboardPageId = useContext(DashboardPageIdContext);
  const { slice_name: chartName } = useSelector(
    (state: { sliceEntities: { slices: Record<number, Slice> } }) =>
      state.sliceEntities?.slices?.[chartId] || {},
  );
  const canExplore = useSelector((state: RootState) =>
    findPermission('can_explore', 'Zobi', state.user?.roles),
  );

  const exploreUrl = useMemo(
    () => `/explore/?dashboard_page_id=${dashboardPageId}&slice_id=${chartId}`,
    [chartId, dashboardPageId],
  );

  const exploreChart = useCallback(() => {
    history.push(exploreUrl);
  }, [exploreUrl, history]);

  return (
    <Modal
      show={showModal}
      onHide={onHideModal ?? (() => null)}
      css={css`
        .ant-modal-body {
          display: flex;
          flex-direction: column;
        }
      `}
      name={t('Drill to detail: %s', chartName)}
      title={t('Drill to detail: %s', chartName)}
      footer={
        <ModalFooter exploreChart={exploreChart} canExplore={canExplore} />
      }
      responsive
      resizable
      resizableConfig={{
        minHeight: theme.sizeUnit * 128,
        minWidth: theme.sizeUnit * 128,
        defaultSize: {
          width: 'auto',
          height: '75vh',
        },
      }}
      draggable
      destroyOnHidden
      maskClosable={false}
    >
      <DrillDetailPane
        formData={formData}
        initialFilters={initialFilters}
        dataset={dataset}
      />
    </Modal>
  );
}
