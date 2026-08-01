import {
  Children,
  cloneElement,
  FunctionComponentElement,
  useMemo,
} from 'react';
import { JsonObject, JsonValue } from '@zobi.dev/core';
import { useTheme } from '@zobi.dev/extension-api/theme';
import { Constants } from '@zobi.dev/core/components';
import { debounce } from 'lodash';
import { ControlFormItemNode } from './ControlFormItem';

export * from './ControlFormItem';

export type ControlFormRowProps = {
  children: ControlFormItemNode | ControlFormItemNode[];
};

export function ControlFormRow({ children }: ControlFormRowProps) {
  const { sizeUnit } = useTheme();
  return (
    <div
      css={{
        display: 'flex',
        flexWrap: 'nowrap',
        marginBottom: sizeUnit,
        maxWidth: '100%',
      }}
    >
      {children}
    </div>
  );
}

type ControlFormRowNode = FunctionComponentElement<ControlFormRowProps>;

export type ControlFormProps = {
  /**
   * Form field values dict.
   */
  value?: JsonObject;
  onChange: (value: JsonObject) => void;
  children: ControlFormRowNode | ControlFormRowNode[];
};

/**
 * Light weight form for control panel.
 */
export default function ControlForm({
  onChange,
  value,
  children,
}: ControlFormProps) {
  const theme = useTheme();
  const debouncedOnChange = useMemo(
    () =>
      ({
        0: onChange,
        [Constants.FAST_DEBOUNCE]: debounce(onChange, Constants.FAST_DEBOUNCE),
      }) as Record<number, typeof onChange>,
    [onChange],
  );

  const updatedChildren = Children.map(children, row => {
    if ('children' in row.props) {
      const defaultWidth = Array.isArray(row.props.children)
        ? `${100 / row.props.children.length}%`
        : undefined;
      return cloneElement(row, {
        children: Children.map(row.props.children, item => {
          const {
            name,
            width,
            debounceDelay = Constants.FAST_DEBOUNCE,
            onChange: onItemValueChange,
          } = item.props;
          return cloneElement(item, {
            width: width || defaultWidth,
            value: value?.[name],
            // remove `debounceDelay` from rendered control item props
            // so React DevTools don't throw a `invalid prop` warning.
            debounceDelay: undefined,
            onChange(fieldValue: JsonValue) {
              // call `onChange` on each FormItem
              if (onItemValueChange) {
                onItemValueChange(fieldValue);
              }
              // propagate to the form
              if (!(debounceDelay in debouncedOnChange)) {
                debouncedOnChange[debounceDelay] = debounce(
                  onChange,
                  debounceDelay,
                );
              }
              debouncedOnChange[debounceDelay]({
                ...value,
                [name]: fieldValue,
              });
            },
          });
        }),
      });
    }
    return row;
  });
  return (
    <div
      css={{
        label: {
          color: theme.colorTextLabel,
          fontSize: theme.fontSizeSM,
        },
      }}
    >
      {updatedChildren}
    </div>
  );
}
