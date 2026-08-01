import { t } from '@zobi/core/translation';
import { FormItem, Input, FormInstance } from '@zobi-ui/core/components';
import { ModalFormField } from 'src/components/Modal';
import { ValidationObject } from 'src/components/Modal/useModalValidation';

interface BasicInfoSectionProps {
  form: FormInstance;
  validationStatus: ValidationObject;
}

const BasicInfoSection = ({
  form,
  validationStatus,
}: BasicInfoSectionProps) => {
  const titleValue = form.getFieldValue('title');
  const hasError =
    validationStatus.basic?.hasErrors &&
    (!titleValue || titleValue.trim().length === 0);

  return (
    <>
      <ModalFormField
        label={t('Name')}
        required
        testId="dashboard-name-field"
        error={hasError ? t('Dashboard name is required') : undefined}
      >
        <FormItem
          name="title"
          noStyle
          rules={[
            {
              required: true,
              message: t('Dashboard name is required'),
              whitespace: true,
            },
          ]}
        >
          <Input
            placeholder={t('The display name of your dashboard')}
            data-test="dashboard-title-input"
            type="text"
          />
        </FormItem>
      </ModalFormField>
      <ModalFormField
        label={t('URL Slug')}
        testId="dashboard-slug-field"
        bottomSpacing={false}
      >
        <FormItem name="slug" noStyle>
          <Input
            placeholder={t('A readable URL for your dashboard')}
            data-test="dashboard-slug-input"
            type="text"
          />
        </FormItem>
      </ModalFormField>
    </>
  );
};

export default BasicInfoSection;
