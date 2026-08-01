
import type {
  CSSProperties,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from 'react';

export type OnClickHandler = MouseEventHandler<HTMLElement>;

export type LabelType =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default'
  | 'primary';

export interface LabelProps extends HTMLAttributes<HTMLSpanElement> {
  key?: string;
  className?: string;
  onClick?: OnClickHandler;
  type?: LabelType;
  style?: CSSProperties;
  children?: ReactNode;
  role?: string;
  monospace?: boolean;
  icon?: ReactNode;
}
