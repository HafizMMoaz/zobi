import { useCallback, useState } from 'react';
import { t } from '@zobi/core/translation';
import { getChartMetadataRegistry } from '@zobi-ui/core';
import { css, styled, ZobiTheme } from '@zobi/core/theme';
import { usePluginContext } from 'src/components';
import { Icons, Modal } from '@zobi-ui/core/components';
import { noOp } from 'src/utils/common';
import getBootstrapData from 'src/utils/getBootstrapData';
import { FilterPlugins } from 'src/constants';
import VizTypeGallery, {
  MAX_ADVISABLE_VIZ_GALLERY_WIDTH,
} from './VizTypeGallery';
import { FastVizSwitcher } from './FastVizSwitcher';
import { VizTypeControlProps } from './types';

const bootstrapData = getBootstrapData();
const denyList: string[] = (
  bootstrapData.common.conf.VIZ_TYPE_DENYLIST || []
).concat(Object.values(FilterPlugins));
const metadataRegistry = getChartMetadataRegistry();

export const VIZ_TYPE_CONTROL_TEST_ID = 'viz-type-control';

function VizSupportValidation({ vizType }: { vizType: string }) {
  const state = usePluginContext();
  if (state.loading || metadataRegistry.has(vizType)) {
    return null;
  }
  return (
    <div
      className="text-danger"
      css={(theme: ZobiTheme) => css`
        margin-top: ${theme.sizeUnit}px;
      `}
    >
      <Icons.ExclamationCircleOutlined className="text-danger" />{' '}
      <small>{t('This visualization type is not supported.')}</small>
    </div>
  );
}

const UnpaddedModal = styled(Modal)`
  .ant-modal-body {
    padding: 0;
  }
`;

/** Manages the viz type and the viz picker modal */
const VizTypeControl = ({
  value: initialValue,
  onChange = noOp,
  isModalOpenInit,
}: VizTypeControlProps) => {
  const [showModal, setShowModal] = useState(!!isModalOpenInit);
  // a trick to force re-initialization of the gallery each time the modal opens,
  // ensuring that the modal always opens to the correct category.
  const [modalKey, setModalKey] = useState(0);
  const [selectedViz, setSelectedViz] = useState<string | null>(initialValue);

  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const onSubmit = useCallback(() => {
    onChange(selectedViz);
    setShowModal(false);
  }, [selectedViz, onChange]);

  const onCancel = useCallback(() => {
    setShowModal(false);
    setModalKey(key => key + 1);
    // make sure the modal re-opens to the last submitted viz
    setSelectedViz(initialValue);
  }, [initialValue]);

  return (
    <>
      <div
        css={(theme: ZobiTheme) => css`
          min-width: ${theme.sizeUnit * 72}px;
          max-width: fit-content;
        `}
      >
        <FastVizSwitcher onChange={onChange} currentSelection={initialValue} />
        {initialValue && <VizSupportValidation vizType={initialValue} />}
      </div>
      <div
        css={(theme: ZobiTheme) => css`
          display: flex;
          justify-content: flex-end;
          margin-top: ${theme.sizeUnit * 2}px;
          color: ${theme.colorTextSecondary};
          text-decoration: underline;
          font-size: ${theme.fontSizeSM}px;
          color: ${theme.colorTextTertiary};
        `}
      >
        <span role="button" tabIndex={0} onClick={openModal}>
          {t('View all charts')}
        </span>
      </div>
      <UnpaddedModal
        show={showModal}
        onHide={onCancel}
        title={t('Select a visualization type')}
        primaryButtonName={t('Select')}
        disablePrimaryButton={!selectedViz}
        onHandledPrimaryAction={onSubmit}
        maxWidth={`${MAX_ADVISABLE_VIZ_GALLERY_WIDTH}px`}
        responsive
      >
        {/* When the key increments, it forces react to re-init the gallery component */}
        <VizTypeGallery
          key={modalKey}
          selectedViz={selectedViz}
          onChange={setSelectedViz}
          onDoubleClick={onSubmit}
          denyList={denyList}
        />
      </UnpaddedModal>
    </>
  );
};

export default VizTypeControl;
