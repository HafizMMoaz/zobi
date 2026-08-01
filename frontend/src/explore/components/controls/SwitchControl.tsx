import { type ReactNode } from 'react';
import { css } from '@zobi.dev/extension-api/theme';
import { Switch } from '@zobi.dev/core/components';
import ControlHeader from '../ControlHeader';

interface SwitchControlProps {
  value?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  hovered?: boolean;
  onChange?: (value: boolean) => void;
  validationErrors?: string[];
}

export default function SwitchControl({
  value = false,
  onChange,
  ...props
}: SwitchControlProps) {
  const handleChange = (checked: boolean) => {
    onChange?.(checked);
  };

  const switchNode = (
    <Switch size="small" checked={!!value} onChange={handleChange} />
  );

  if (props.label) {
    return (
      <div
        css={css`
          .ControlHeader .pull-left {
            display: flex;
            align-items: center;
          }
        `}
      >
        <ControlHeader
          {...props}
          leftNode={switchNode}
          onClick={() => handleChange(!value)}
        />
      </div>
    );
  }
  return switchNode;
}
