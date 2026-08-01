import { useState } from 'react';
import type { LabeledErrorBoundInputProps } from './types';
import { LabeledErrorBoundInput } from './LabeledErrorBoundInput';

export default {
  title: 'Components/Form/LabeledErrorBoundInput',
  component: LabeledErrorBoundInput,
};

export const InteractiveLabeledErrorBoundInput = ({
  name,
  value,
  placeholder,
  type,
  id,
  tooltipText,
}: LabeledErrorBoundInputProps) => {
  const [currentValue, setCurrentValue] = useState(value);

  const validateFunctionality: (value: any) => string = value => {
    setCurrentValue(value.target.value);
    if (value.target.value.includes('success')) {
      return 'success';
    }
    return 'error';
  };

  return (
    <LabeledErrorBoundInput
      id={id}
      name={name}
      validationMethods={{ onChange: validateFunctionality }}
      errorMessage={
        currentValue === 'success' ? '' : 'Type success in the text bar'
      }
      helpText="This is a line of example help text"
      value={currentValue}
      // This must stay the same as name or form breaks
      label={name}
      placeholder={placeholder}
      type={type}
      required
      hasTooltip
      tooltipText={tooltipText}
    />
  );
};

InteractiveLabeledErrorBoundInput.args = {
  name: 'Username',
  placeholder: 'Example placeholder text...',
  id: 1,
  tooltipText: 'This is a tooltip',
};

InteractiveLabeledErrorBoundInput.argTypes = {
  type: {
    defaultValue: 'textbox',
    control: {
      type: 'select',
      options: ['textbox', 'checkbox', 'radio'],
    },
  },
};
