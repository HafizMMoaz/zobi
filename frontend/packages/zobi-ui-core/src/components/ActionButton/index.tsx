
import type { ReactElement, ReactNode } from 'react';
import { Tooltip, type TooltipPlacement } from '@zobi-ui/core/components';
import { css, useTheme } from '@zobi/core-legacy/theme';

export interface ActionProps {
  label: string;
  tooltip?: string | ReactElement;
  placement?: TooltipPlacement;
  icon: ReactNode;
  onClick: () => void;
}

export const ActionButton = ({
  label,
  tooltip,
  placement,
  icon,
  onClick,
}: ActionProps) => {
  const theme = useTheme();
  const actionButton = (
    <span
      role="button"
      tabIndex={0}
      css={css`
        cursor: pointer;
        color: ${theme.colorIcon};
        margin-right: ${theme.sizeUnit}px;
        &:hover {
          path {
            fill: ${theme.colorPrimary};
          }
        }
      `}
      className="action-button"
      data-test={label}
      onClick={onClick}
    >
      {icon}
    </span>
  );

  const tooltipId = `${label.replaceAll(' ', '-').toLowerCase()}-tooltip`;

  return tooltip ? (
    <Tooltip id={tooltipId} title={tooltip} placement={placement}>
      {actionButton}
    </Tooltip>
  ) : (
    actionButton
  );
};
