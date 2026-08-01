import { type ComponentProps } from 'react';

import { Dropdown } from 'antd';
import type { TooltipPlacement } from '../Tooltip/types';

export type DropdownButtonProps = ComponentProps<typeof Dropdown.Button> & {
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
};
