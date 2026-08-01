import { useState, FunctionComponentElement, ChangeEvent } from 'react';
import { JsonValue } from '@zobi.dev/core';
import { useTheme } from '@zobi.dev/extension-api/theme';
import { ControlFormItemComponents } from './controls';
import ControlHeader, { ControlHeaderProps } from '../../../ControlHeader';
import { ControlFormItemDefaultSpec } from '../types';

export * from './controls';

export type ControlFormItemProps = ControlFormItemDefaultSpec & {
  name: string;
  onChange?: (fieldValue: JsonValue) => void;
};

export type ControlFormItemNode =
  FunctionComponentElement<ControlFormItemProps>;

/**
 * Accept `false` or `0`, but not empty string.
 */
function isEmptyValue(value?: JsonValue) {
  return value == null || value === '';
}

export function ControlFormItem({
  name,
  label,
  description,
  width,
  validators,
  onChange,
  value: initialValue,
  defaultValue,
  controlType,
  ...props
}: ControlFormItemProps) {
  const { sizeUnit } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [value, setValue] = useState(
    initialValue === undefined ? defaultValue : initialValue,
  );
  const [validationErrors, setValidationErrors] =
    useState<ControlHeaderProps['validationErrors']>();

  const handleChange = (e: ChangeEvent<HTMLInputElement> | JsonValue) => {
    const fieldValue =
      e && typeof e === 'object' && 'target' in e
        ? e.target.type === 'checkbox' || e.target.type === 'radio'
          ? e.target.checked
          : e.target.value
        : e;
    const errors =
      (validators
        ?.map(validator =>
          isEmptyValue(fieldValue) ? false : validator(fieldValue),
        )
        .filter(x => !!x) as string[]) || [];
    setValidationErrors(errors);
    setValue(fieldValue);
    if (errors.length === 0 && onChange) {
      onChange(fieldValue as JsonValue);
    }
  };

  const Control = ControlFormItemComponents[controlType];

  return (
    <div
      css={{
        margin: 2 * sizeUnit,
        width,
        maxWidth: '100%',
        flex: 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {controlType === 'Checkbox' ? (
        <ControlFormItemComponents.Checkbox
          value={value as boolean}
          onChange={handleChange}
          name={name}
          label={label}
          description={description}
          validationErrors={validationErrors}
          {...props}
        />
      ) : (
        <>
          {label && (
            <ControlHeader
              name={name}
              label={label}
              description={description}
              validationErrors={validationErrors}
              hovered={hovered}
            />
          )}
          {/* @ts-expect-error - dynamic Control component has varying prop types */}
          <Control {...props} value={value} onChange={handleChange} />
        </>
      )}
    </div>
  );
}

export default ControlFormItem;
