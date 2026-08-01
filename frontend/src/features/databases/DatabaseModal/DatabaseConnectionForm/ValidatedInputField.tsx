import { t } from '@zobi.dev/extension-api/translation';
import { LabeledErrorBoundInput as ValidatedInput } from '@zobi.dev/core/components';
import { DatabaseParameters, FieldPropTypes } from '../../types';

const FIELD_TEXT_MAP = {
  account: {
    label: t('Account'),
    helpText: t(
      'Copy the identifier of the account you are trying to connect to.',
    ),
    placeholder: t('e.g. xy12345.us-east-2.aws'),
  },
  warehouse: {
    label: t('Warehouse'),
    placeholder: t('e.g. compute_wh'),
    className: 'form-group-w-50',
  },
  role: {
    label: t('Role'),
    placeholder: t('e.g. AccountAdmin'),
    className: 'form-group-w-50',
  },
};

type FieldTextMapKey = keyof typeof FIELD_TEXT_MAP;

export const validatedInputField = ({
  required,
  changeMethods,
  getValidation,
  validationErrors,
  db,
  field,
}: FieldPropTypes) => (
  <ValidatedInput
    id={field}
    name={field}
    required={required}
    value={db?.parameters?.[field as keyof DatabaseParameters]}
    validationMethods={{ onBlur: getValidation }}
    errorMessage={validationErrors?.[field]}
    placeholder={FIELD_TEXT_MAP[field as FieldTextMapKey].placeholder}
    helpText={FIELD_TEXT_MAP[field as 'account']?.helpText}
    label={FIELD_TEXT_MAP[field as FieldTextMapKey].label || field}
    onChange={changeMethods.onParametersChange}
    className={FIELD_TEXT_MAP[field as 'warehouse' | 'role'].className || field}
  />
);
