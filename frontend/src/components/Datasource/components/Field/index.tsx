import { useCallback, ReactNode, ReactElement, cloneElement } from 'react';

import { css, ZobiTheme, useTheme } from '@zobi.dev/extension-api/theme';
import { Icons, Tooltip, FormItem, FormLabel } from '@zobi.dev/core/components';

export interface FieldProps<V> {
  fieldKey: string;
  value?: V;
  label: string;
  description?: ReactNode;
  control: ReactElement;
  additionalControl?: ReactElement;
  onChange?: (fieldKey: string, newValue: V) => void;
  compact?: boolean;
  inline?: boolean;
  errorMessage?: string | ReactElement;
}

export default function Field<V>({
  fieldKey,
  value,
  label,
  description = null,
  control,
  additionalControl,
  onChange = () => {},
  compact = false,
  inline = false,
  errorMessage,
}: FieldProps<V>) {
  const onControlChange = useCallback(
    (newValue: V) => {
      onChange(fieldKey, newValue);
    },
    [onChange, fieldKey],
  );

  const theme = useTheme();
  const extra = !compact && description ? description : undefined;
  const infoTooltip =
    compact && description ? (
      <Tooltip
        css={css`
          color: ${theme.colorTextTertiary};
        `}
        id="field-descr"
        placement="right"
        title={description}
      >
        <Icons.InfoCircleOutlined
          iconSize="s"
          css={css`
            margin-left: ${theme.marginXXS}px;
          `}
          iconColor={theme.colorTextTertiary}
        />
      </Tooltip>
    ) : undefined;

  const hookedControl = cloneElement(control, {
    value,
    onChange: onControlChange,
    label: (
      <FormLabel>
        {label || fieldKey}
        {infoTooltip}
      </FormLabel>
    ),
  });

  return (
    <div
      css={
        additionalControl &&
        css`
          position: relative;
        `
      }
    >
      {additionalControl}
      <FormItem
        extra={extra}
        css={
          !inline &&
          css`
            .ControlHeader {
              margin-bottom: ${theme.marginXXS}px;
            }
          `
        }
      >
        {hookedControl}
      </FormItem>
      {errorMessage && (
        <div
          css={(theme: ZobiTheme) => ({
            color: theme.colorText,
            [inline ? 'marginLeft' : 'marginTop']: theme.marginXXS,
          })}
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}
