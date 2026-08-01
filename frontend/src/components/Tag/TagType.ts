import { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { SerializedStyles } from '@emotion/react';

export interface TagType {
  id?: number;
  className?: string;
  type?: string | number;
  editable?: boolean;
  onDelete?: (index: number) => void;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  onMouseDown?: MouseEventHandler<HTMLSpanElement>;
  onClose?: () => void;
  color?: string;
  name?: string;
  index?: number;
  toolTipTitle?: string;
  children?: ReactNode;
  role?: string;
  style?: CSSProperties;
  icon?: ReactNode;
  css?: SerializedStyles;
  closable?: boolean;
}

export enum TagTypeEnum {
  Custom = 1,
  Type = 2,
  Owner = 3,
  FavoritedBy = 4,
}
