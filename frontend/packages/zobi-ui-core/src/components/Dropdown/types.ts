import type { DropdownProps as AntdDropdownProps } from 'antd';
import type { ReactElement, ReactNode, FocusEvent, KeyboardEvent } from 'react';

export enum IconOrientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export interface MenuDotsDropdownProps extends AntdDropdownProps {
  overlay?: ReactElement;
  iconOrientation?: IconOrientation;
}

export interface NoAnimationDropdownProps extends AntdDropdownProps {
  children: ReactNode;
  onBlur?: (e: FocusEvent<HTMLDivElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}

export type DropdownProps = AntdDropdownProps;
