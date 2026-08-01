import { styled } from '@zobi.dev/extension-api/theme';
import { t } from '@zobi.dev/extension-api/translation';
import { Icons, Modal, Typography, Button } from '@zobi.dev/core/components';
import type { FC, ReactElement, ReactNode } from 'react';

const IconWrapper = styled.span`
  margin-right: ${({ theme }) => theme.sizeUnit * 2}px;
`;

const DEFAULT_ICON = <Icons.QuestionCircleOutlined iconSize="m" />;

export type ConfirmModalProps = {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  body: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'primary' | 'danger' | 'dashed';
  icon?: ReactNode;
  loading?: boolean;
};

export const ConfirmModal: FC<ConfirmModalProps> = ({
  show,
  onHide,
  onConfirm,
  title,
  body,
  confirmText = t('Confirm'),
  cancelText = t('Cancel'),
  confirmButtonStyle = 'primary',
  icon = DEFAULT_ICON,
  loading = false,
}: ConfirmModalProps): ReactElement => (
  <Modal
    centered
    responsive
    onHide={onHide}
    show={show}
    width="600px"
    title={
      <>
        <IconWrapper>{icon}</IconWrapper>
        {title}
      </>
    }
    footer={
      <>
        <Button buttonStyle="secondary" onClick={onHide} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          buttonStyle={confirmButtonStyle}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </>
    }
  >
    {typeof body === 'string' ? (
      <Typography.Text>{body}</Typography.Text>
    ) : (
      body
    )}
  </Modal>
);
