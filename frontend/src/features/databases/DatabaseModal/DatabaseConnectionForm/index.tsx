import { ZobiTheme } from '@zobi/core/theme';
import { Form } from '@zobi-ui/core/components';
import { FormFieldOrder, FORM_FIELD_MAP } from './constants';
import { formScrollableStyles, validatedFormStyles } from '../styles';
import { DatabaseConnectionFormProps } from '../../types';

const DatabaseConnectionForm = ({
  dbModel,
  db,
  editNewDb,
  getPlaceholder,
  getValidation,
  isEditMode = false,
  onAddTableCatalog,
  onChange,
  onExtraInputChange,
  onEncryptedExtraInputChange,
  onParametersChange,
  onParametersUploadFileChange,
  onQueryChange,
  onRemoveTableCatalog,
  sslForced,
  validationErrors,
  clearValidationErrors,
  isValidating,
}: DatabaseConnectionFormProps) => {
  const parameters = dbModel?.parameters as {
    properties: {
      [key: string]: {
        default?: any;
        description?: string;
      };
    };
    required?: string[];
  };

  return (
    <Form>
      <div
        css={(theme: ZobiTheme) => [
          formScrollableStyles,
          validatedFormStyles(theme),
        ]}
      >
        {parameters &&
          FormFieldOrder.filter(
            (key: string) =>
              Object.keys(parameters.properties).includes(key) ||
              key === 'database_name',
          ).map(field =>
            // @ts-expect-error TODO: fix ComponentClass for SSHTunnelSwitchComponent not having call signature.
            FORM_FIELD_MAP[field]({
              required: parameters.required?.includes(field),
              changeMethods: {
                onParametersChange,
                onChange,
                onQueryChange,
                onParametersUploadFileChange,
                onAddTableCatalog,
                onRemoveTableCatalog,
                onExtraInputChange,
                onEncryptedExtraInputChange,
              },
              validationErrors,
              getValidation,
              clearValidationErrors,
              db,
              key: field,
              field,
              default_value: parameters.properties[field]?.default,
              description: parameters.properties[field]?.description,
              isEditMode,
              sslForced,
              editNewDb,
              isValidating,
              placeholder: getPlaceholder ? getPlaceholder(field) : undefined,
            }),
          )}
      </div>
    </Form>
  );
};
export const FormFieldMap = FORM_FIELD_MAP;

export default DatabaseConnectionForm;
