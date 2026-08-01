import { type ReactNode } from 'react';
import { css, useTheme } from '@zobi/core/theme';
import { JsonValue } from '@zobi-ui/core';
import { Radio } from '@zobi-ui/core/components/Radio';
import { Space } from '@zobi-ui/core/components/Space';
import { Tooltip } from '@zobi-ui/core/components/Tooltip';
import { Icons } from '@zobi-ui/core/components/Icons';
import ControlHeader from '../ControlHeader';

interface RadioOption {
  value: JsonValue;
  label: ReactNode;
  disabled?: boolean;
  tooltip?: string;
}

type RadioOptionTuple = [JsonValue, ReactNode];

interface VerticalRadioControlProps {
  value?: JsonValue;
  label?: ReactNode;
  description?: ReactNode;
  hovered?: boolean;
  options: (RadioOption | RadioOptionTuple)[];
  onChange: (value: JsonValue) => void;
  validationErrors?: string[];
}

function normalizeOption(option: RadioOption | RadioOptionTuple): RadioOption {
  if (Array.isArray(option)) {
    return { value: option[0], label: option[1] };
  }
  return option;
}

export default function VerticalRadioControl({
  value: initialValue,
  options,
  onChange,
  ...props
}: VerticalRadioControlProps) {
  const theme = useTheme();
  const normalizedOptions = options.map(normalizeOption);
  const currentValue = initialValue ?? normalizedOptions[0]?.value;

  return (
    <div
      css={css`
        .ant-radio-wrapper {
          display: flex;
          align-items: center;
        }
      `}
    >
      <ControlHeader {...props} />
      <Radio.Group
        value={currentValue}
        onChange={e => onChange(e.target.value)}
      >
        <Space direction="vertical">
          {normalizedOptions.map(
            ({ value: val, label, disabled = false, tooltip }) => (
              <Radio key={JSON.stringify(val)} value={val} disabled={disabled}>
                {label}
                {tooltip && (
                  <Tooltip title={tooltip} placement="right">
                    <Icons.InfoCircleOutlined
                      css={css`
                        margin-left: 4px;
                        font-size: 12px;
                        color: ${disabled
                          ? theme.colorTextDisabled
                          : theme.colorTextTertiary};
                        cursor: help;
                      `}
                    />
                  </Tooltip>
                )}
              </Radio>
            ),
          )}
        </Space>
      </Radio.Group>
    </div>
  );
}
