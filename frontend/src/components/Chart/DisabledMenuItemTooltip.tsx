
import { ReactNode } from 'react';
import { css, ZobiTheme } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Tooltip } from '@zobi.dev/core/components';

export const MenuItemTooltip = ({
  title,
  color,
}: {
  title: ReactNode;
  color?: string;
}) => (
  <Tooltip title={title} placement="top">
    <Icons.InfoCircleOutlined
      data-test="tooltip-trigger"
      css={(theme: ZobiTheme) => css`
        color: ${color || theme.colorTextLabel};
        margin-left: ${theme.sizeUnit * 2}px;
        &.anticon {
          font-size: unset;
          .anticon {
            line-height: unset;
            vertical-align: unset;
          }
        }
      `}
    />
  </Tooltip>
);
