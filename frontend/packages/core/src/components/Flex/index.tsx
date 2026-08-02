import { Flex as AntdFlex } from 'antd';
import type { FlexProps } from './types';

export function Flex(props: FlexProps) {
  return <AntdFlex {...props} />;
}

export type { FlexProps };
