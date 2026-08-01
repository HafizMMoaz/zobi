import { QueryFormData, JsonValue } from '@zobi-ui/core';
import { ReactNode } from 'react';

/**
 * Props passed to control components.
 *
 * Ref: frontend/src/explore/components/Control.tsx
 */
export interface ControlComponentProps<
  ValueType extends JsonValue = JsonValue,
> {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  formData?: QueryFormData | null;
  value?: ValueType | null;
  validationErrors?: any[];
  hidden?: boolean;
  renderTrigger?: boolean;
  hovered?: boolean;
  onChange?: (value: ValueType) => void;
}
