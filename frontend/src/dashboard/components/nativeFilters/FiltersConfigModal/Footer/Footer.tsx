import { FC } from 'react';
import { Button, type OnClickHandler } from '@zobi-ui/core/components';
import { t } from '@zobi/core/translation';
import { CancelConfirmationAlert } from './CancelConfirmationAlert';

type FooterProps = {
  onCancel: OnClickHandler;
  handleSave: OnClickHandler;
  onConfirmCancel: OnClickHandler;
  onDismiss: OnClickHandler;
  saveAlertVisible: boolean;
  canSave?: boolean;
};

const Footer: FC<FooterProps> = ({
  canSave = true,
  onCancel,
  handleSave,
  onDismiss,
  onConfirmCancel,
  saveAlertVisible,
}) => {
  if (saveAlertVisible) {
    return (
      <CancelConfirmationAlert
        key="cancel-confirm"
        title={t('There are unsaved changes.')}
        onConfirm={onConfirmCancel}
        onDismiss={onDismiss}
      >
        {t('Are you sure you want to cancel?')}
      </CancelConfirmationAlert>
    );
  }

  return (
    <>
      <Button
        key="cancel"
        buttonStyle="secondary"
        data-test="native-filter-modal-cancel-button"
        onClick={onCancel}
      >
        {t('Cancel')}
      </Button>
      <Button
        disabled={!canSave}
        key="submit"
        buttonStyle="primary"
        onClick={handleSave}
        data-test="native-filter-modal-save-button"
      >
        {t('Save')}
      </Button>
    </>
  );
};

export default Footer;
