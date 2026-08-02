import { Empty as AntdEmpty } from 'antd';
import { EmptyProps } from 'antd/es/empty';

export const Empty = Object.assign(
  (props: EmptyProps) => <AntdEmpty {...props} />,
  {
    PRESENTED_IMAGE_SIMPLE: AntdEmpty.PRESENTED_IMAGE_SIMPLE,
    PRESENTED_IMAGE_DEFAULT: AntdEmpty.PRESENTED_IMAGE_DEFAULT,
  },
);

export type { EmptyProps };
