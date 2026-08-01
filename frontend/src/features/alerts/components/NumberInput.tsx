import { Input } from '@zobi-ui/core/components';
import { useState, ChangeEvent } from 'react';

interface NumberInputProps {
  timeUnit: string;
  min: number;
  name: string;
  value: string | number;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function NumberInput({
  timeUnit,
  min,
  name,
  value,
  placeholder,
  onChange,
  ...rest
}: NumberInputProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <Input
      type="text"
      min={min}
      name={name}
      value={value ? `${value}${!isFocused ? ` ${timeUnit}` : ''}` : ''}
      placeholder={placeholder}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onChange={onChange}
      {...rest}
    />
  );
}
