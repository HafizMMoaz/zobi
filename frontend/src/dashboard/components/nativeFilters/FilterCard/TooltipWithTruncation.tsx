import { Tooltip, type TooltipProps } from '@zobi-ui/core/components';
import { TooltipTrigger } from './Styles';

export const TooltipWithTruncation = ({
  title,
  children,
  ...props
}: TooltipProps) => (
  <Tooltip
    title={title}
    placement="bottom"
    overlayClassName="filter-card-tooltip"
    {...props}
  >
    <TooltipTrigger>{children}</TooltipTrigger>
  </Tooltip>
);
