import { ReactNode } from 'react';
import { t } from '@zobi/core/translation';
import { styled } from '@zobi/core/theme';
import { Modal, Loading, Flex } from '@zobi-ui/core/components';
import { ModalTitleWithIcon } from 'src/components/ModalTitleWithIcon';

interface StandardModalProps {
  width?: number;
  title: string;
  icon?: ReactNode;
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saveLoading?: boolean;
  saveText?: string;
  cancelText?: string;
  errorTooltip?: ReactNode;
  children: ReactNode;
  isEditMode?: boolean;
  centered?: boolean;
  destroyOnClose?: boolean;
  maskClosable?: boolean;
  wrapProps?: object;
  contentLoading?: boolean;
}

// Standard modal widths
export const MODAL_STANDARD_WIDTH = 500;
export const MODAL_MEDIUM_WIDTH = 600;
export const MODAL_LARGE_WIDTH = 900;

const StyledModal = styled(Modal)`
  .ant-modal-body {
    max-height: 80vh;
    height: auto;
    overflow-y: auto;
    padding: 0;
  }

  .ant-modal-header {
    padding: ${({ theme }) => theme.sizeUnit * 3}px
      ${({ theme }) => theme.sizeUnit * 4}px
      ${({ theme }) => theme.sizeUnit * 3}px;
    margin-bottom: 0;
    border-bottom: 1px solid ${({ theme }) => theme.colorBorder};
  }

  .ant-modal-footer {
    height: ${({ theme }) => theme.sizeUnit * 16.25}px;
  }

  .control-label {
    margin-top: ${({ theme }) => theme.sizeUnit}px;
  }

  /* Remove top margin from collapse component */
  .ant-collapse {
    border: none;

    > .ant-collapse-item:first-of-type {
      border-top: none;
    }

    /* Remove margin from collapse headers */
    .ant-collapse-header {
      padding-bottom: 0 !important;

      /* Remove margin from the CollapseLabelInModal component */
      > div {
        margin-bottom: 0;
      }
    }
  }

  /* Ensure collapse sections have proper padding */
  .ant-collapse-content-box {
    padding: ${({ theme }) => theme.sizeUnit * 4}px;
  }
`;

export function StandardModal({
  width = MODAL_STANDARD_WIDTH,
  title,
  icon,
  show,
  onHide,
  onSave,
  saveDisabled = false,
  saveLoading = false,
  saveText,
  cancelText,
  errorTooltip,
  children,
  isEditMode = false,
  centered = true,
  destroyOnClose = true,
  maskClosable = false,
  wrapProps,
  contentLoading = false,
}: StandardModalProps) {
  const primaryButtonName = saveText || (isEditMode ? t('Save') : t('Add'));

  return (
    <StyledModal
      disablePrimaryButton={saveDisabled || saveLoading || contentLoading}
      primaryButtonLoading={saveLoading}
      primaryTooltipMessage={errorTooltip}
      onHandledPrimaryAction={onSave}
      onHide={onHide}
      primaryButtonName={primaryButtonName}
      show={show}
      width={`${width}px`}
      wrapProps={wrapProps}
      centered={centered}
      title={
        icon ? (
          <ModalTitleWithIcon
            isEditMode={isEditMode}
            title={title}
            data-test="standard-modal-title"
          />
        ) : (
          title
        )
      }
    >
      {contentLoading ? (
        <Flex justify="center" align="center" style={{ minHeight: 200 }}>
          <Loading />
        </Flex>
      ) : (
        children
      )}
    </StyledModal>
  );
}
