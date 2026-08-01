import { ReactNode } from 'react';
import { css, styled } from '@zobi/core/theme';
import { InfoTooltip } from '@zobi-ui/core/components';

interface ModalFormFieldProps {
  label: string;
  required?: boolean;
  tooltip?: ReactNode;
  error?: string;
  helperText?: string;
  bottomSpacing?: boolean;
  children: ReactNode;
  testId?: string;
  validateStatus?: 'success' | 'warning' | 'error' | 'validating';
  hasFeedback?: boolean;
}

const StyledFieldContainer = styled.div<{ bottomSpacing: boolean }>`
  ${({ theme, bottomSpacing }) => css`
    flex: 1;
    margin-top: 0px;
    margin-bottom: ${bottomSpacing ? theme.sizeUnit * 4 : 0}px;

    .control-label {
      margin-top: ${theme.sizeUnit}px;
      margin-bottom: ${theme.sizeUnit * 2}px;
      color: ${theme.colorText};
      font-size: ${theme.fontSize}px;
    }

    .required {
      margin-left: ${theme.sizeUnit / 2}px;
      color: ${theme.colorError};
    }

    .helper {
      display: block;
      color: ${theme.colorTextTertiary};
      font-size: ${theme.fontSizeSM}px;
      padding: ${theme.sizeUnit}px 0;
      text-align: left;
    }

    .error {
      color: ${theme.colorError};
      font-size: ${theme.fontSizeSM}px;
      margin-top: ${theme.sizeUnit}px;
    }

    .input-container {
      display: flex;
      align-items: center;

      > div {
        width: 100%;
      }

      label {
        display: flex;
        margin-right: ${theme.sizeUnit * 2}px;
      }

      i {
        margin: 0 ${theme.sizeUnit}px;
      }
    }

    input,
    textarea {
      flex: 1 1 auto;
    }

    input[disabled] {
      color: ${theme.colorTextDisabled};
    }

    textarea {
      resize: vertical;
    }

    input::placeholder,
    textarea::placeholder {
      color: ${theme.colorTextPlaceholder};
    }

    textarea,
    input[type='text'],
    input[type='number'] {
      padding: ${theme.sizeUnit}px ${theme.sizeUnit * 2}px;
      border-style: none;
      border: 1px solid ${theme.colorBorder};
      border-radius: ${theme.borderRadius}px;

      &[name='description'] {
        flex: 1 1 auto;
      }
    }
  `}
`;

export function ModalFormField({
  label,
  required = false,
  tooltip,
  error,
  helperText,
  bottomSpacing = true,
  children,
  testId,
  validateStatus,
  hasFeedback = false,
}: ModalFormFieldProps) {
  return (
    <StyledFieldContainer bottomSpacing={bottomSpacing} data-test={testId}>
      <div className="control-label">
        {label}
        {tooltip && <InfoTooltip tooltip={tooltip} />}
        {required && <span className="required">*</span>}
      </div>
      <div className="input-container">{children}</div>
      {helperText && <div className="helper">{helperText}</div>}
      {error && <div className="error">{error}</div>}
    </StyledFieldContainer>
  );
}
