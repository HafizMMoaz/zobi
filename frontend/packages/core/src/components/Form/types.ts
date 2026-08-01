export type { FormProps, FormInstance, FormItemProps } from 'antd/es/form';

export interface LabeledErrorBoundInputProps {
  label?: string;
  validationMethods:
    | { onBlur: (value: any) => void }
    | { onChange: (value: any) => void };
  errorMessage?: string | null;
  helpText?: string;
  required?: boolean;
  hasTooltip?: boolean;
  tooltipText?: string | null;
  id?: string;
  classname?: string;
  visibilityToggle?: boolean;
  [x: string]: any;
}
