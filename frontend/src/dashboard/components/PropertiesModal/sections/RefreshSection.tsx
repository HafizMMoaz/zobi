import { t } from '@zobi/core/translation';
import { ModalFormField } from 'src/components/Modal';
import { RefreshFrequencySelect } from '../../RefreshFrequency/RefreshFrequencySelect';

interface RefreshSectionProps {
  refreshFrequency: number;
  onRefreshFrequencyChange: (value: number) => void;
}

const RefreshSection = ({
  refreshFrequency,
  onRefreshFrequencyChange,
}: RefreshSectionProps) => (
  <ModalFormField
    label={t('Refresh frequency')}
    helperText={t(
      'Set the automatic refresh frequency for this dashboard. The dashboard will reload its data at the specified interval.',
    )}
    bottomSpacing={false}
  >
    <RefreshFrequencySelect
      value={refreshFrequency}
      onChange={onRefreshFrequencyChange}
    />
  </ModalFormField>
);

export default RefreshSection;
