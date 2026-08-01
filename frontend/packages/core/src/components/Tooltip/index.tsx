import { Tooltip as AntdTooltip } from 'antd';

import type { TooltipProps, TooltipPlacement } from './types';

export const Tooltip = ({ overlayStyle, ...props }: TooltipProps) => (
  <AntdTooltip
    styles={{
      body: { overflow: 'hidden', textOverflow: 'ellipsis' },
      root: overlayStyle ?? {},
    }}
    {...props}
  />
);
export type { TooltipProps, TooltipPlacement };
