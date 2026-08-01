import { ReactNode } from 'react';
import { t } from '@zobi/core/translation';
import { JsonValue } from '@zobi-ui/core';
import { Radio, Tooltip, TooltipPlacement } from '@zobi-ui/core/components';
import { ControlHeader } from '../../components/ControlHeader';

export interface RadioButtonOptionObject {
  value: JsonValue;
  label: Exclude<ReactNode, null | undefined | boolean>;
  disabled?: boolean;
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
}

export type RadioButtonOption =
  | [JsonValue, Exclude<ReactNode, null | undefined | boolean>]
  | RadioButtonOptionObject;

export interface RadioButtonControlProps {
  label?: ReactNode;
  description?: string;
  options: RadioButtonOption[];
  hovered?: boolean;
  value?: JsonValue;
  onChange: (opt: JsonValue) => void;
}

function normalizeOption(option: RadioButtonOption): RadioButtonOptionObject {
  if (Array.isArray(option)) {
    return {
      value: option[0],
      label: option[1],
    };
  }
  return option;
}

export default function RadioButtonControl({
  value: initialValue,
  options,
  onChange,
  ...props
}: RadioButtonControlProps) {
  const normalizedOptions = options.map(normalizeOption);
  const currentValue = initialValue || normalizedOptions[0].value;

  return (
    <div>
      <div
        role="tablist"
        aria-label={typeof props.label === 'string' ? props.label : undefined}
      >
        <ControlHeader {...props} />
        <Radio.Group
          value={currentValue}
          onChange={e => onChange(e.target.value)}
        >
          {normalizedOptions.map(
            ({
              value: val,
              label,
              disabled = false,
              tooltip,
              tooltipPlacement = 'top',
            }) => {
              const button = (
                <Radio.Button
                  key={JSON.stringify(val)}
                  value={val}
                  disabled={disabled}
                  aria-label={typeof label === 'string' ? label : undefined}
                  id={`tab-${val}`}
                  type="button"
                  aria-selected={val === currentValue}
                  className={`btn btn-default ${
                    val === currentValue ? 'active' : ''
                  }`}
                  onClick={e => {
                    e.currentTarget?.focus();
                    onChange(val);
                  }}
                >
                  {label}
                </Radio.Button>
              );

              if (tooltip) {
                return (
                  <Tooltip
                    key={JSON.stringify(val)}
                    title={tooltip}
                    placement={tooltipPlacement}
                  >
                    {button}
                  </Tooltip>
                );
              }

              return button;
            },
          )}
        </Radio.Group>
      </div>
      <div
        aria-live="polite"
        style={{
          position: 'absolute',
          left: '-9999px',
          height: '1px',
          width: '1px',
          overflow: 'hidden',
        }}
      >
        {t(
          '%s tab selected',
          normalizedOptions.find(({ value: val }) => val === currentValue)
            ?.label,
        )}
      </div>
    </div>
  );
}
