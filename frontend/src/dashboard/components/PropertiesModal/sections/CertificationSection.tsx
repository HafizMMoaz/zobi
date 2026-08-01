import { t } from '@zobi/core/translation';
import { FormItem, Input } from '@zobi-ui/core/components';
import { ModalFormField } from 'src/components/Modal';

interface CertificationSectionProps {
  isLoading: boolean;
}

const CertificationSection = ({ isLoading }: CertificationSectionProps) => (
  <>
    <ModalFormField
      label={t('Certified by')}
      helperText={t('Person or group that has certified this dashboard.')}
    >
      <FormItem name="certifiedBy" noStyle>
        <Input type="text" disabled={isLoading} />
      </FormItem>
    </ModalFormField>
    <ModalFormField
      label={t('Certification details')}
      helperText={t(
        'Any additional detail to show in the certification tooltip.',
      )}
      bottomSpacing={false}
    >
      <FormItem name="certificationDetails" noStyle>
        <Input type="text" disabled={isLoading} />
      </FormItem>
    </ModalFormField>
  </>
);

export default CertificationSection;
