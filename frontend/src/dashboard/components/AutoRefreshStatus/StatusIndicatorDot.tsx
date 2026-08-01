import { FC, useMemo, useRef, useEffect, useState } from 'react';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import { AutoRefreshStatus } from '../../types/autoRefresh';

export interface StatusIndicatorDotProps {
  /** Current status to display */
  status: AutoRefreshStatus;
  /** Size of the dot in pixels */
  size?: number;
}

/**
 * Status indicator configuration mapping.
 *
 * - Green dot: Refreshed on schedule
 * - Blue dot: Fetching data or waiting for first refresh
 * - Yellow/warning dot: Delayed
 * - Red dot: Error
 * - White dot: Paused
 */
interface StatusConfig {
  color: string;
  needsBorder: boolean;
  outlineColor?: string;
}

export const getStatusConfig = (
  theme: ReturnType<typeof useTheme>,
  status: AutoRefreshStatus,
): StatusConfig => {
  switch (status) {
    case AutoRefreshStatus.Success:
      return {
        color: theme.colorSuccess,
        needsBorder: false,
      };
    case AutoRefreshStatus.Idle:
      return {
        color: theme.colorInfo,
        needsBorder: false,
      };
    case AutoRefreshStatus.Fetching:
      return {
        color: theme.colorInfo,
        needsBorder: false,
      };
    case AutoRefreshStatus.Delayed:
      return {
        color: theme.colorWarning,
        needsBorder: false,
      };
    case AutoRefreshStatus.Error:
      return {
        color: theme.colorError,
        needsBorder: false,
      };
    case AutoRefreshStatus.Paused:
      return {
        color: theme.colorBgContainer,
        needsBorder: true,
        outlineColor: 'currentColor',
      };
    default:
      return {
        color: theme.colorTextSecondary,
        needsBorder: false,
      };
  }
};

/**
 * A colored dot indicator that shows the auto-refresh status.
 *
 * Uses CSS transitions to prevent flickering between states.
 * The color change is animated smoothly rather than instantly.
 */
export const StatusIndicatorDot: FC<StatusIndicatorDotProps> = ({
  status,
  size = 10,
}) => {
  const theme = useTheme();

  // Debounce rapid status changes to prevent flickering
  const [displayStatus, setDisplayStatus] = useState(status);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // For fetching state, update immediately to show user something is happening
    if (status === AutoRefreshStatus.Fetching) {
      setDisplayStatus(status);
    } else {
      // For other states, debounce to prevent flickering
      timerRef.current = setTimeout(() => {
        setDisplayStatus(status);
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [status]);

  const statusConfig = useMemo(
    () => getStatusConfig(theme, displayStatus),
    [theme, displayStatus],
  );

  const dotStyles = useMemo(
    () => css`
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      color: ${theme.colorTextSecondary};
      background-color: ${statusConfig.color};
      transition:
        background-color ${theme.motionDurationMid} ease-in-out,
        border-color ${theme.motionDurationMid} ease-in-out;
      border: ${statusConfig.needsBorder ? '1px solid' : 'none'};
      border-color: ${statusConfig.needsBorder
        ? statusConfig.outlineColor
        : 'transparent'};
      box-shadow: ${statusConfig.needsBorder
        ? 'none'
        : `0 0 0 2px ${theme.colorBgContainer}`};
      margin-left: ${theme.marginXS}px;
      margin-right: ${theme.marginXS}px;
      cursor: help;
    `,
    [statusConfig, size, theme],
  );

  return (
    <span
      css={dotStyles}
      role="status"
      aria-label={`Auto-refresh status: ${displayStatus}`}
      data-test="status-indicator-dot"
      data-status={displayStatus}
      data-size={size}
    />
  );
};

export default StatusIndicatorDot;
