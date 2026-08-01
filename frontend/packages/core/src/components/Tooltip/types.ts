import { Tooltip } from 'antd';

export type TooltipProps = React.ComponentProps<typeof Tooltip> & {
  overlayStyle?: React.CSSProperties;
};

export type TooltipPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom';
