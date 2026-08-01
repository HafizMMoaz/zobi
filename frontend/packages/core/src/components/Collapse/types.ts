import type { CollapseProps as AntdCollapseProps } from 'antd';

export interface CollapseProps extends AntdCollapseProps {
  animateArrows?: boolean;
  modalMode?: boolean;
}
