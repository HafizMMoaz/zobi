import { useState, useCallback, ReactNode } from 'react';
import { ConfirmModal } from '@zobi.dev/core/components';

export interface ConfirmConfig {
  title: string;
  body: string | ReactNode;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'primary' | 'danger' | 'dashed';
  icon?: ReactNode;
}

export const useConfirmModal = () => {
  const [config, setConfig] = useState<ConfirmConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const showConfirm = useCallback((options: ConfirmConfig) => {
    setConfig(options);
  }, []);

  const handleHide = useCallback(() => {
    if (!loading) {
      setConfig(null);
    }
  }, [loading]);

  const handleConfirm = useCallback(async () => {
    if (!config) return;

    try {
      setLoading(true);
      await config.onConfirm();
      setConfig(null);
    } catch (error) {
      // Let the error propagate but keep modal open
      // eslint-disable-next-line no-console
      console.error('Confirm action failed:', error);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const ConfirmModalComponent = config ? (
    <ConfirmModal
      show={!!config}
      onHide={handleHide}
      onConfirm={handleConfirm}
      title={config.title}
      body={config.body}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      confirmButtonStyle={config.confirmButtonStyle}
      icon={config.icon}
      loading={loading}
    />
  ) : null;

  return { showConfirm, ConfirmModal: ConfirmModalComponent };
};
