import { useEffect, useRef, useState } from 'react';
import { ZobiClient } from '@zobi.dev/core';
import { t } from '@zobi.dev/extension-api/translation';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import { Alert } from '@zobi.dev/extension-api/components';
import {
  FormModal,
  FormItem,
  Input,
  Button,
  Modal,
} from '@zobi.dev/core/components';
import { useToasts } from 'src/components/MessageToasts/withToasts';

interface ApiKeyCreateModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

interface FormValues {
  name: string;
}

export function ApiKeyCreateModal({
  show,
  onHide,
  onSuccess,
}: ApiKeyCreateModalProps) {
  const theme = useTheme();
  const { addDangerToast, addSuccessToast } = useToasts();
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    },
    [],
  );

  const handleFormSubmit = async (values: FormValues) => {
    try {
      const response = await ZobiClient.post({
        endpoint: '/api/v1/security/api_keys/',
        jsonPayload: values,
      });
      const key = response.json?.result?.key;
      if (!key) {
        throw new Error('API response did not include a key');
      }
      setCreatedKey(key);
      addSuccessToast(t('API key created successfully'));
    } catch (error) {
      addDangerToast(t('Failed to create API key'));
      throw error;
    }
  };

  const handleCopyKey = async () => {
    if (!createdKey) {
      return;
    }
    try {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      addDangerToast(t('Failed to copy API key to clipboard'));
    }
  };

  const handleClose = () => {
    if (createdKey) {
      onSuccess();
    }
    setCreatedKey(null);
    setCopied(false);
    onHide();
  };

  if (createdKey) {
    return (
      <Modal
        show={show}
        onHide={handleClose}
        title={t('API Key Created')}
        maskClosable={false}
        closable={false}
        footer={
          <Button type="primary" onClick={handleClose}>
            {t('Done')}
          </Button>
        }
      >
        <Alert
          type="warning"
          message={t('Save this API key securely')}
          description={t(
            'This is the only time you will see this key. Store it securely.',
          )}
          showIcon
          css={css`
            margin-bottom: ${theme.sizeUnit * 4}px;
          `}
        />
        <div
          css={css`
            display: flex;
            gap: ${theme.sizeUnit * 2}px;
            align-items: center;
          `}
        >
          <Input
            value={createdKey}
            readOnly
            css={css`
              flex: 1;
              font-family: monospace;
            `}
          />
          <Button onClick={handleCopyKey}>
            {copied ? t('Copied!') : t('Copy')}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <FormModal
      show={show}
      onHide={handleClose}
      title={t('Create API Key')}
      onSave={() => {}}
      formSubmitHandler={handleFormSubmit}
      requiredFields={['name']}
    >
      <FormItem
        name="name"
        label={t('Name')}
        rules={[{ required: true, message: t('API key name is required') }]}
      >
        <Input
          name="name"
          placeholder={t('e.g., CI/CD Pipeline, Analytics Script')}
        />
      </FormItem>
    </FormModal>
  );
}
