import { useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { Alert } from '@zobi.dev/extension-api/components';
import { useTheme } from '@zobi.dev/extension-api/theme';
import {
  Icons,
  Modal,
  Tooltip,
  Typography,
} from '@zobi.dev/core/components';
import type { ErrorAlertProps } from './types';

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  errorType = t('Error'),
  message,
  type = 'error',
  description,
  descriptionDetails,
  descriptionDetailsCollapsed = true,
  messagePre = false,
  descriptionPre = true,
  compact = false,
  children,
  closable = true,
  showIcon = true,
  className,
}) => {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(
    !descriptionDetailsCollapsed,
  );
  const [showModal, setShowModal] = useState(false);

  const toggleDescription = () => {
    setIsDescriptionVisible(!isDescriptionVisible);
  };

  const theme = useTheme();
  const renderTrigger = () => {
    const icon =
      type === 'warning' ? (
        <Icons.WarningOutlined />
      ) : (
        <Icons.ExclamationCircleOutlined />
      );
    const color =
      type === 'warning' ? theme.colorWarningText : theme.colorErrorText;
    return (
      <div className={className} style={{ cursor: 'pointer' }}>
        <span style={{ color }}>{icon} </span>
        {errorType}
      </div>
    );
  };
  const preStyle = {
    whiteSpace: 'pre-wrap' as const,
    fontFamily: theme.fontFamilyCode,
    margin: `${theme.sizeUnit}px 0`,
  };
  const renderDescription = () => (
    <div>
      {message &&
        (messagePre ? (
          <Typography.Paragraph style={preStyle}>
            {message}
          </Typography.Paragraph>
        ) : (
          <div>{message}</div>
        ))}
      {description && (
        <Typography.Paragraph
          style={descriptionPre ? preStyle : {}}
          data-testid="description"
        >
          {description}
        </Typography.Paragraph>
      )}
      {descriptionDetails && (
        <div>
          {isDescriptionVisible && (
            <Typography.Paragraph style={descriptionPre ? preStyle : {}}>
              {descriptionDetails}
            </Typography.Paragraph>
          )}
          <span
            role="button"
            tabIndex={0}
            onClick={toggleDescription}
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            {isDescriptionVisible ? t('See less') : t('See more')}
          </span>
        </div>
      )}
      {children}
    </div>
  );
  const renderAlert = (closable: boolean) => (
    <Alert
      message={errorType}
      description={renderDescription()}
      type={type}
      showIcon={showIcon}
      closable={closable}
      className={className}
    />
  );

  if (compact) {
    return (
      <>
        <Tooltip title={`${errorType}: ${message}`}>
          <span role="button" onClick={() => setShowModal(true)} tabIndex={0}>
            {renderTrigger()}
          </span>
        </Tooltip>
        <Modal
          name={errorType}
          title={errorType}
          show={showModal}
          onHide={() => setShowModal(false)}
          footer={null}
        >
          {renderAlert(false)}
        </Modal>
      </>
    );
  }

  return renderAlert(closable);
};
