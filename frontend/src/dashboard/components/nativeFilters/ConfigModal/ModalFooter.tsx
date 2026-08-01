import { FC, ReactNode } from 'react';
import {
  Button,
  type OnClickHandler,
  Icons,
  Flex,
} from '@zobi.dev/core/components';
import { t } from '@zobi.dev/extension-api/translation';
import { Alert } from '@zobi.dev/extension-api/components';
import { styled, css, useTheme } from '@zobi.dev/extension-api/theme';
import { BaseExpandButtonWrapper } from './SharedStyles';

const StyledAlert = styled(Alert)`
  text-align: left;
  flex: 1;

  & .ant-alert-action {
    align-self: center;
  }
`;

const StyledActionButtons = styled.div`
  display: flex;
`;

const StyledFooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
`;

export interface ConfirmationAlertProps {
  title: string;
  children: ReactNode;
  onConfirm: OnClickHandler;
  onDismiss: OnClickHandler;
}

export function ConfirmationAlert({
  title,
  onConfirm,
  onDismiss,
  children,
}: ConfirmationAlertProps) {
  return (
    <StyledAlert
      closable={false}
      type="warning"
      key="alert"
      message={title}
      description={children}
      action={
        <StyledActionButtons>
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
            data-test="modal-confirm-cancel-button"
          >
            {t('Yes, cancel')}
          </Button>
        </StyledActionButtons>
      }
    />
  );
}

export interface ModalFooterProps {
  onCancel: OnClickHandler;
  onSave: OnClickHandler;
  onConfirmCancel: OnClickHandler;
  onDismiss: OnClickHandler;
  saveAlertVisible: boolean;
  canSave?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  saveButtonTestId?: string;
  cancelButtonTestId?: string;
  saveButtonText?: string;
  cancelButtonText?: string;
  confirmationTitle?: string;
  confirmationMessage?: string;
}

export const ModalFooter: FC<ModalFooterProps> = ({
  canSave = true,
  onCancel,
  onSave,
  onDismiss,
  onConfirmCancel,
  saveAlertVisible,
  expanded = false,
  onToggleExpand,
  saveButtonTestId = 'modal-save-button',
  cancelButtonTestId = 'modal-cancel-button',
  saveButtonText = t('Save'),
  cancelButtonText = t('Cancel'),
  confirmationTitle = t('There are unsaved changes.'),
  confirmationMessage = t('Are you sure you want to cancel?'),
}) => {
  const theme = useTheme();

  if (saveAlertVisible) {
    return (
      <ConfirmationAlert
        key="cancel-confirm"
        title={confirmationTitle}
        onConfirm={onConfirmCancel}
        onDismiss={onDismiss}
      >
        {confirmationMessage}
      </ConfirmationAlert>
    );
  }

  return (
    <StyledFooterContainer>
      <Flex
        css={css`
          gap: 8px;
        `}
      >
        <Button
          key="cancel"
          buttonStyle="secondary"
          data-test={cancelButtonTestId}
          onClick={onCancel}
        >
          {cancelButtonText}
        </Button>
        <Button
          disabled={!canSave}
          key="submit"
          buttonStyle="primary"
          onClick={onSave}
          data-test={saveButtonTestId}
        >
          {saveButtonText}
        </Button>
      </Flex>
      {onToggleExpand && (
        <BaseExpandButtonWrapper>
          {(() => {
            const ToggleIcon = expanded
              ? Icons.FullscreenExitOutlined
              : Icons.FullscreenOutlined;
            return (
              <ToggleIcon
                iconSize="l"
                iconColor={theme.colorTextSecondary}
                onClick={onToggleExpand}
              />
            );
          })()}
        </BaseExpandButtonWrapper>
      )}
    </StyledFooterContainer>
  );
};

export default ModalFooter;
