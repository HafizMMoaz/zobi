import { ReactNode } from 'react';
import { styled } from '@zobi.dev/extension-api/theme';

export type FormLabelProps = {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
};

const Label = styled.label<{ required?: boolean }>`
  ${({ required, theme }) =>
    required &&
    `
      &::after {
        display: inline-block;
        margin-left: ${theme.sizeUnit}px;
        color: ${theme.colorError};
        font-size: ${theme.fontSize}px;
        content: '*';
      }
    `}
`;

export function FormLabel({
  children,
  htmlFor,
  required = false,
  className,
}: FormLabelProps) {
  return (
    <Label htmlFor={htmlFor} className={className} required={required}>
      {children}
    </Label>
  );
}
