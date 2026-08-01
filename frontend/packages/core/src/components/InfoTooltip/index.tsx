import { KeyboardEvent, useMemo } from 'react';
import { SerializedStyles, CSSObject } from '@emotion/react';
import { kebabCase } from 'lodash';
import { t } from '@zobi.dev/extension-api/translation';
import { css, useTheme, getFontSize } from '@zobi.dev/extension-api/theme';
import {
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { Tooltip, TooltipProps, TooltipPlacement } from '../Tooltip';

export interface InfoTooltipProps {
  label?: string;
  tooltip?: TooltipProps['title'];
  onClick?: () => void;
  placement?: TooltipPlacement;
  className?: string;
  iconStyle?: CSSObject | SerializedStyles;
  type?: 'info' | 'warning' | 'notice' | 'error' | 'question';
  iconSize?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
}

export const InfoTooltip = ({
  type = 'info',
  iconSize = 's',
  label,
  tooltip,
  onClick,
  className = 'text-muted',
  placement = 'right',
  iconStyle,
}: InfoTooltipProps) => {
  const theme = useTheme();

  const infoTooltipWithTriggerVariants = useMemo(
    () => ({
      info: { color: theme.colorIcon, icon: <InfoCircleOutlined /> },
      question: { color: theme.colorIcon, icon: <QuestionCircleOutlined /> },
      warning: { color: theme.colorWarning, icon: <WarningOutlined /> },
      notice: { color: theme.colorWarning, icon: <ThunderboltOutlined /> },
      error: { color: theme.colorError, icon: <CloseCircleOutlined /> },
    }),
    [theme],
  );

  const variant = type ? infoTooltipWithTriggerVariants[type] : null;

  const iconCss = css`
    color: ${variant?.color ?? theme.colorIcon};
    font-size: ${getFontSize(theme, iconSize)}px;
  `;

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      onClick();
    }
  };

  const iconEl = (
    <Button
      type="text"
      variant="text"
      data-test="info-tooltip-icon"
      aria-label={t('Show info tooltip')}
      className={className}
      css={[
        theme => css`
          vertical-align: text-bottom;
          box-shadow: none;
          padding: 0;
          height: auto;
          background: none;
          &&&:hover,
          &&&:focus,
          &&&:active {
            box-shadow: none;
            background: none;
            outline: none;
            color: ${theme.colorTextTertiary};
          }
          ${onClick ? 'cursor: pointer;' : ''}
        `,
        iconCss,
        iconStyle,
      ]}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {variant?.icon}
    </Button>
  );

  if (!tooltip) {
    return iconEl;
  }

  return (
    <Tooltip
      id={`${kebabCase(label) || Math.floor(Math.random() * 10000)}-tooltip`}
      title={tooltip}
      placement={placement}
    >
      {iconEl}
    </Tooltip>
  );
};
