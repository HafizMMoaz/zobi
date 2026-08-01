import { Popconfirm as AntdPopconfirm } from 'antd';
import { PopconfirmProps as AntdPopconfirmProps } from 'antd/es/popconfirm';

export interface PopconfirmProps extends AntdPopconfirmProps {}

export const Popconfirm = (props: PopconfirmProps) => (
  <AntdPopconfirm {...props} />
);
