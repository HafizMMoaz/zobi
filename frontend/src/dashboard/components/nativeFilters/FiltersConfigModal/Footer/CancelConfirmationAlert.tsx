import { ReactNode } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { Button, type OnClickHandler } from '@zobi.dev/core/components';
import { Alert } from '@zobi.dev/extension-api/components';

export interface ConfirmationAlertProps {
  title: string;
  children: ReactNode;
  onConfirm: OnClickHandler;
  onDismiss: OnClickHandler;
}

export function CancelConfirmationAlert({
  title,
  onConfirm,
  onDismiss,
  children,
}: ConfirmationAlertProps) {
  return (
    <Alert
      closable={false}
      type="warning"
      key="alert"
      message={title}
      css={{
        textAlign: 'left',
        flex: 1,
        '& .ant-alert-action': { alignSelf: 'center' },
      }}
      description={children}
      action={
        <div css={{ display: 'flex' }}>
          <Button
            key="cancel"
            buttonSize="small"
            buttonStyle="secondary"
            onClick={onDismiss}
          >
            {t('Keep editing')}
          </Button>
          <Button
            key="submit"
            buttonSize="small"
            buttonStyle="primary"
            onClick={onConfirm}
            data-test="native-filter-modal-confirm-cancel-button"
          >
            {t('Yes, cancel')}
          </Button>
        </div>
      }
    />
  );
}
