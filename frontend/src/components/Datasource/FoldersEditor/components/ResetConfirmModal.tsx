
import { memo } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { Modal } from '@zobi.dev/core/components';

interface ResetConfirmModalProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ResetConfirmModalInner({
  show,
  onCancel,
  onConfirm,
}: ResetConfirmModalProps) {
  return (
    <Modal
      title={t('Reset to default folders?')}
      show={show}
      onHide={onCancel}
      onHandledPrimaryAction={onConfirm}
      primaryButtonName={t('Reset')}
      primaryButtonStyle="danger"
    >
      {t(
        'This will reorganize all metrics and columns into default folders. Any custom folders will be removed.',
      )}
    </Modal>
  );
}

export const ResetConfirmModal = memo(ResetConfirmModalInner);
