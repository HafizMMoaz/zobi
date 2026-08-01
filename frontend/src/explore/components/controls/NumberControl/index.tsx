import { useRef } from 'react';
import { styled } from '@zobi.dev/extension-api/theme';
import { InputNumber } from '@zobi.dev/core/components/Input';
import ControlHeader, { ControlHeaderProps } from '../../ControlHeader';

type NumberValueType = number | undefined;

export interface NumberControlProps extends ControlHeaderProps {
  onChange?: (value: NumberValueType) => void;
  value?: NumberValueType;
  label?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
}

const FullWidthDiv = styled.div`
  width: 100%;
`;

const FullWidthInputNumber = styled(InputNumber)`
  width: 100%;
`;

function parseValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

export default function NumberControl({
  min,
  max,
  step,
  placeholder,
  value,
  onChange,
  disabled,
  ...rest
}: NumberControlProps) {
  const pendingValueRef = useRef<NumberValueType>(value);

  const handleChange = (val: string | number | null) => {
    pendingValueRef.current = parseValue(val);
  };

  const handleBlur = () => {
    onChange?.(pendingValueRef.current);
  };

  const handleStep = (val: number) => {
    pendingValueRef.current = val;
    onChange?.(val);
  };

  return (
    <FullWidthDiv>
      <ControlHeader {...rest} />
      <FullWidthInputNumber
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onStep={handleStep}
        disabled={disabled}
        aria-label={rest.label}
      />
    </FullWidthDiv>
  );
}
