import { Collapse } from '.';
import type { CollapseProps } from './types';

export default {
  title: 'Components/Collapse',
  component: Collapse,
};

export const InteractiveCollapse = (args: CollapseProps) => (
  <Collapse
    defaultActiveKey={['1']}
    {...args}
    items={[
      {
        key: '1',
        label: 'Header 1',
        children: 'Content 1',
      },
      {
        key: '2',
        label: 'Header 2',
        children: 'Content 2',
      },
    ]}
  />
);

InteractiveCollapse.args = {
  ghost: false,
  bordered: true,
  accordion: false,
  animateArrows: false,
  modalMode: false,
};

InteractiveCollapse.argTypes = {
  theme: {
    table: {
      disable: true,
    },
  },
};

InteractiveCollapse.parameters = {
  actions: {
    disable: true,
  },
};
