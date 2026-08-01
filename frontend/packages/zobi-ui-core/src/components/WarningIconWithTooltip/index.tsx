import { useTheme } from '@zobi/core-legacy/theme';
import { Icons, type IconType, SafeMarkdown, Tooltip } from '..';

export interface WarningIconWithTooltipProps {
  warningMarkdown: string;
  size?: IconType['iconSize'];
  marginRight?: number;
}

function WarningIconWithTooltip({
  warningMarkdown,
  size,
  marginRight,
}: WarningIconWithTooltipProps) {
  const theme = useTheme();
  return (
    <Tooltip
      id="warning-tooltip"
      title={<SafeMarkdown source={warningMarkdown} />}
    >
      <Icons.WarningOutlined
        iconColor={theme.colorWarning}
        iconSize={size}
        css={{ marginRight: marginRight ?? theme.sizeUnit * 2 }}
      />
    </Tooltip>
  );
}

export default WarningIconWithTooltip;
