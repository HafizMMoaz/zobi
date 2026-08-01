import { styled } from '@zobi/core-legacy/theme';
import { Badge as AntdBadge } from 'antd';
import type { BadgeProps } from './types';

export const Badge = styled((props: BadgeProps) => <AntdBadge {...props} />)`
  ${({ theme, color, count }) => `
    & > sup,
    & > sup.ant-badge-count {
      box-shadow: none;
      ${
        count !== undefined ? `background: ${color || theme.colorPrimary};` : ''
      }
    }
  `}
`;

export type { BadgeProps };
