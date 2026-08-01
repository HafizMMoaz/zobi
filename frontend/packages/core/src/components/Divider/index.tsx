import { css } from '@zobi.dev/extension-api/theme';
import { Divider as AntdDivider } from 'antd';
import type { DividerProps } from './types';

export function Divider(props: DividerProps) {
  return (
    <AntdDivider
      css={theme => css`
        margin: ${theme.margin}px 0;
      `}
      {...props}
    />
  );
}
export type { DividerProps };
