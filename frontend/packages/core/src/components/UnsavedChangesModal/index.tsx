import { t } from '@zobi.dev/extension-api/translation';
import { Icons, Modal, Typography, Button } from '@zobi.dev/core/components';
import type { FC, ReactElement } from 'react';

// Ant Design's default modal zIndex is 1000. Using a higher value ensures
// this dialog always renders above other open modals (e.g. a draggable View SQL modal).
const UNSAVED_CHANGES_MODAL_Z_INDEX = 1100;

export type UnsavedChangesModalProps = {
  showModal: boolean;
  onHide: () => void;
  handleSave: () => void;
  onConfirmNavigation: () => void;
  title?: string;
  body?: string;
  zIndex?: number;
};

export const UnsavedChangesModal: FC<UnsavedChangesModalProps> = ({
  showModal,
  onHide,
  handleSave,
  onConfirmNavigation,
  title = 'Unsaved Changes',
  body = "If you don't save, changes will be lost.",
  zIndex = UNSAVED_CHANGES_MODAL_Z_INDEX,
}: UnsavedChangesModalProps): ReactElement => (
  <Modal
    centered
    responsive
    onHide={onHide}
    show={showModal}
    width="444px"
    zIndex={zIndex}
    title={
      <>
        <Icons.WarningOutlined iconSize="m" style={{ marginRight: 8 }} />
        {title}
      </>
    }
    footer={
      <>
        <Button buttonStyle="secondary" onClick={onConfirmNavigation}>
          {t('Discard')}
        </Button>
        <Button buttonStyle="primary" onClick={handleSave}>
          {t('Save')}
        </Button>
      </>
    }
  >
    <Typography.Text>{body}</Typography.Text>
  </Modal>
);
