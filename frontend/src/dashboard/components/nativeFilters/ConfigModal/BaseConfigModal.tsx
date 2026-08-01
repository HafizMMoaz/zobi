import { ReactNode, useState, useCallback } from 'react';
import type { FormInstance } from '@zobi.dev/core/components';
import { ErrorBoundary } from 'src/components/ErrorBoundary';
import { BaseModalBody, BaseForm, BaseModalWrapper } from './SharedStyles';
import { ModalFooter } from './ModalFooter';

export interface BaseConfigModalProps {
  isOpen: boolean;
  title: string;
  expanded?: boolean;
  onCancel: () => void;
  onSave: () => void;
  leftPane: ReactNode;
  rightPane: ReactNode;
  footer?: ReactNode;
  form?: FormInstance;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  canSave?: boolean;
  saveAlertVisible?: boolean;
  onDismissSaveAlert?: () => void;
  onConfirmCancel?: () => void;
  onToggleExpand?: () => void;
  testId?: string;
  maskClosable?: boolean;
  destroyOnClose?: boolean;
  centered?: boolean;
}

export const BaseConfigModal = ({
  isOpen,
  title,
  expanded = false,
  onCancel,
  onSave,
  leftPane,
  rightPane,
  footer,
  form,
  onValuesChange,
  canSave = true,
  saveAlertVisible = false,
  onDismissSaveAlert,
  onConfirmCancel,
  onToggleExpand,
  testId = 'base-config-modal',
  maskClosable = false,
  destroyOnClose = true,
  centered = true,
}: BaseConfigModalProps) => {
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isExpandedControlled = onToggleExpand !== undefined;
  const isExpanded = isExpandedControlled ? expanded : internalExpanded;

  const handleToggleExpand = useCallback(() => {
    if (isExpandedControlled && onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  }, [isExpandedControlled, onToggleExpand, internalExpanded]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleSave = useCallback(() => {
    onSave();
  }, [onSave]);

  const handleDismissSaveAlert = useCallback(() => {
    if (onDismissSaveAlert) {
      onDismissSaveAlert();
    }
  }, [onDismissSaveAlert]);

  const handleConfirmCancel = useCallback(() => {
    if (onConfirmCancel) {
      onConfirmCancel();
    } else {
      onCancel();
    }
  }, [onConfirmCancel, onCancel]);

  const defaultFooter = (
    <ModalFooter
      onCancel={handleCancel}
      onSave={handleSave}
      onConfirmCancel={handleConfirmCancel}
      onDismiss={handleDismissSaveAlert}
      saveAlertVisible={saveAlertVisible}
      canSave={canSave}
      expanded={isExpanded}
      onToggleExpand={handleToggleExpand}
      saveButtonTestId={`${testId}-save-button`}
      cancelButtonTestId={`${testId}-cancel-button`}
    />
  );

  return (
    <BaseModalWrapper
      open={isOpen}
      onCancel={handleCancel}
      onOk={handleSave}
      title={title}
      footer={footer || defaultFooter}
      centered={centered}
      destroyOnClose={destroyOnClose}
      maskClosable={maskClosable}
      data-test={testId}
      expanded={isExpanded}
    >
      <ErrorBoundary>
        <BaseModalBody expanded={isExpanded}>
          <BaseForm
            form={form}
            onValuesChange={onValuesChange}
            layout="vertical"
            css={{ width: '100%' }}
          >
            {leftPane}
            {rightPane}
          </BaseForm>
        </BaseModalBody>
      </ErrorBoundary>
    </BaseModalWrapper>
  );
};

export default BaseConfigModal;
