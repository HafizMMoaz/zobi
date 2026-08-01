import { Popover as AntdPopover } from 'antd';
import { PopoverProps as AntdPopoverProps } from 'antd/es/popover';

export interface PopoverProps extends AntdPopoverProps {
  forceRender?: boolean;
}

export const Popover = (props: PopoverProps) => <AntdPopover {...props} />;
