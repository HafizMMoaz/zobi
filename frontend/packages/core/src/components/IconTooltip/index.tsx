import { Tooltip } from '../Tooltip';
import { Button } from '../Button';
import type { IconTooltipProps } from './types';

export const IconTooltip = ({
  children = null,
  className = '',
  onClick = () => undefined,
  placement = 'top',
  style = {},
  tooltip = null,
  mouseEnterDelay = 0.3,
  mouseLeaveDelay = 0.15,
}: IconTooltipProps) => {
  const iconTooltip = (
    <Button
      onClick={onClick}
      style={{
        padding: 0,
        ...style,
      }}
      buttonStyle="link"
      className={`IconTooltip ${className}`}
    >
      {children}
    </Button>
  );
  if (tooltip) {
    return (
      <Tooltip
        id="tooltip"
        title={tooltip}
        placement={placement}
        mouseEnterDelay={mouseEnterDelay}
        mouseLeaveDelay={mouseLeaveDelay}
      >
        {iconTooltip}
      </Tooltip>
    );
  }
  return iconTooltip;
};

export type { IconTooltipProps };
