import { ReactNode } from 'react';

export interface IconTooltipProps {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  placement?:
    | 'bottom'
    | 'left'
    | 'right'
    | 'top'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'leftTop'
    | 'leftBottom'
    | 'rightTop'
    | 'rightBottom';
  style?: object;
  tooltip?: string | null;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
}
