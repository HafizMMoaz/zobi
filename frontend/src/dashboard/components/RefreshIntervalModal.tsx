import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import { Form, Checkbox } from '@zobi.dev/core/components';
import { StandardModal } from 'src/components/Modal';
import { RootState } from 'src/dashboard/types';
import {
  RefreshFrequencySelect,
  validateRefreshFrequency,
  getRefreshWarningMessage,
} from './RefreshFrequency';

const ModalContent = styled.div`
  padding: ${({ theme }) => theme.sizeUnit * 4}px;
`;

const CheckboxFormItem = styled(Form.Item)`
  padding-top: ${({ theme }) => theme.sizeUnit * 4}px;
`;

interface RefreshIntervalModalProps {
  show: boolean;
  onHide: () => void;
  refreshFrequency: number;
  onChange: (refreshLimit: number, editMode: boolean) => void;
  editMode: boolean;
  addSuccessToast: (msg: string) => void;
  pauseOnInactiveTab: boolean;
  onPauseOnInactiveTabChange: (checked: boolean) => void;
}

/**
 * Simple refresh interval modal for View Mode (session-only refresh)
 * Separate from PropertiesModal to provide focused UX for temporary refresh
 */
const RefreshIntervalModal = ({
  show,
  onHide,
  refreshFrequency: initialFrequency,
  onChange,
  editMode,
  addSuccessToast,
  pauseOnInactiveTab,
  onPauseOnInactiveTabChange,
}: RefreshIntervalModalProps) => {
  const [refreshFrequency, setRefreshFrequency] = useState(initialFrequency);
  const [localPauseOnInactiveTab, setLocalPauseOnInactiveTab] =
    useState(pauseOnInactiveTab);
  const refreshLimit = useSelector(
    (state: RootState) =>
      state.dashboardInfo?.common?.conf
        ?.ZOBI_DASHBOARD_PERIODICAL_REFRESH_LIMIT,
  );
  const refreshWarning = useSelector(
    (state: RootState) =>
      state.dashboardInfo?.common?.conf
        ?.ZOBI_DASHBOARD_PERIODICAL_REFRESH_WARNING_MESSAGE,
  );
  const refreshErrors = useMemo(
    () => validateRefreshFrequency(refreshFrequency, refreshLimit),
    [refreshFrequency, refreshLimit],
  );
  const refreshWarningMessage = useMemo(
    () =>
      getRefreshWarningMessage(refreshFrequency, refreshLimit, refreshWarning),
    [refreshFrequency, refreshLimit, refreshWarning],
  );

  const handleFrequencyChange = (value: number) => {
    setRefreshFrequency(value);
  };

  const handleSave = () => {
    if (refreshErrors.length > 0) {
      return;
    }
    onChange(refreshFrequency, editMode);
    onPauseOnInactiveTabChange(localPauseOnInactiveTab);
    onHide();
    addSuccessToast(
      editMode
        ? t('Refresh interval saved')
        : t('Refresh interval set for this session'),
    );
  };

  const handleCancel = () => {
    setRefreshFrequency(initialFrequency);
    setLocalPauseOnInactiveTab(pauseOnInactiveTab);
    onHide();
  };

  return (
    <StandardModal
      show={show}
      onHide={handleCancel}
      onSave={handleSave}
      title={t('Refresh interval')}
      width={400}
      saveText={editMode ? t('Save') : t('Save for this session')}
      saveDisabled={refreshErrors.length > 0}
      errorTooltip={refreshErrors[0]}
    >
      <ModalContent>
        <Form layout="vertical">
          <Form.Item
            label={t('Refresh frequency')}
            help={
              refreshErrors[0] ||
              (editMode
                ? t('Set the automatic refresh frequency for this dashboard.')
                : t('Set refresh frequency for current session only.'))
            }
            extra={refreshErrors[0] ? null : refreshWarningMessage}
            validateStatus={refreshErrors.length ? 'error' : undefined}
          >
            <RefreshFrequencySelect
              value={refreshFrequency}
              onChange={handleFrequencyChange}
            />
          </Form.Item>
          <CheckboxFormItem>
            <Checkbox
              checked={localPauseOnInactiveTab}
              onChange={e => setLocalPauseOnInactiveTab(e.target.checked)}
            >
              {t('Pause auto refresh if tab is inactive')}
            </Checkbox>
          </CheckboxFormItem>
        </Form>
      </ModalContent>
    </StandardModal>
  );
};

export default RefreshIntervalModal;
