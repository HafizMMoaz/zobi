
import type { MouseEventHandler, ReactNode } from 'react';
import type {
  ButtonProps as AntdButtonProps,
  ButtonType,
  ButtonVariantType,
  ButtonColorType,
} from 'antd/es/button';
import type { TooltipPlacement } from '../Tooltip/types';

export type { AntdButtonProps, ButtonType, ButtonVariantType, ButtonColorType };

export type OnClickHandler = MouseEventHandler<HTMLElement>;

export type ButtonStyle =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'danger'
  | 'link'
  | 'dashed';

export type ButtonSize = 'default' | 'small' | 'xsmall';

export type ButtonProps = Omit<AntdButtonProps, 'css'> & {
  placement?: TooltipPlacement;
  tooltip?: ReactNode;
  className?: string;
  buttonSize?: ButtonSize;
  buttonStyle?: ButtonStyle;
  cta?: boolean;
  showMarginRight?: boolean;
  icon?: ReactNode;
};
