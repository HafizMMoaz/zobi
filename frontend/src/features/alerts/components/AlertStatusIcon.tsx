import { t } from '@zobi.dev/extension-api/translation';
import { ZobiTheme, useTheme, css } from '@zobi.dev/extension-api/theme';
import { Tooltip } from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import { AlertState } from '../types';

function getStatusColor(
  status: string,
  isReportEnabled: boolean,
  theme: ZobiTheme,
) {
  switch (status) {
    case AlertState.Working:
      return theme.colorPrimaryText;
    case AlertState.Error:
      return theme.colorErrorText;
    case AlertState.Success:
      return theme.colorSuccessText;
    case AlertState.Noop:
      return theme.colorSuccessText;
    case AlertState.Grace:
      return theme.colorErrorText;
    default:
      return theme.colorText;
  }
}

export default function AlertStatusIcon({
  state,
  isReportEnabled = false,
}: {
  state: string;
  isReportEnabled: boolean;
}) {
  const theme = useTheme();
  const lastStateConfig = {
    icon: Icons.CheckOutlined,
    label: '',
    status: '',
  };
  switch (state) {
    case AlertState.Success:
      lastStateConfig.icon = Icons.CheckOutlined;
      lastStateConfig.label = isReportEnabled
        ? t('Report sent')
        : t('Alert triggered, notification sent');
      lastStateConfig.status = AlertState.Success;
      break;
    case AlertState.Working:
      lastStateConfig.icon = Icons.Running;
      lastStateConfig.label = isReportEnabled
        ? t('Report sending')
        : t('Alert running');
      lastStateConfig.status = AlertState.Working;
      break;
    case AlertState.Error:
      lastStateConfig.icon = Icons.CloseOutlined;
      lastStateConfig.label = isReportEnabled
        ? t('Report failed')
        : t('Alert failed');
      lastStateConfig.status = AlertState.Error;
      break;
    case AlertState.Noop:
      lastStateConfig.icon = Icons.CheckOutlined;
      lastStateConfig.label = t('Nothing triggered');
      lastStateConfig.status = AlertState.Noop;
      break;
    case AlertState.Grace:
      lastStateConfig.icon = Icons.WarningOutlined;
      lastStateConfig.label = t('Alert Triggered, In Grace Period');
      lastStateConfig.status = AlertState.Grace;
      break;
    default:
      lastStateConfig.icon = Icons.CheckOutlined;
      lastStateConfig.label = t('Nothing triggered');
      lastStateConfig.status = AlertState.Noop;
  }
  const Icon = lastStateConfig.icon;
  const isRunningIcon = state === AlertState.Working;
  return (
    <Tooltip title={lastStateConfig.label} placement="bottomLeft">
      <span
        css={
          isRunningIcon
            ? css`
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transform: scale(1.8);
              `
            : undefined
        }
      >
        <Icon
          iconSize="m"
          iconColor={getStatusColor(
            lastStateConfig.status,
            isReportEnabled,
            theme,
          )}
        />
      </span>
    </Tooltip>
  );
}
