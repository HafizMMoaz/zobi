import { Menu } from '@zobi-ui/core/components/Menu';
import { DropdownButton } from '.';
import type { DropdownButtonProps } from './types';

export default {
  title: 'Components/DropdownButton',
};

const menu = (
  <Menu
    items={[
      { label: '1st menu item', key: '1' },
      { label: '2nd menu item', key: '2' },
      { label: '3rd menu item', key: '3' },
    ]}
  />
);

const PLACEMENTS = [
  'bottom',
  'bottomLeft',
  'bottomRight',
  'left',
  'leftBottom',
  'leftTop',
  'right',
  'rightBottom',
  'rightTop',
  'top',
  'topLeft',
  'topRight',
];

export const InteractiveDropdownButton = (args: DropdownButtonProps) => (
  <div style={{ margin: '50px 100px' }}>
    <DropdownButton {...args}>Hover</DropdownButton>
  </div>
);

InteractiveDropdownButton.args = {
  tooltip: 'Tooltip',
};

InteractiveDropdownButton.argTypes = {
  placement: {
    defaultValue: 'top',
    control: { type: 'select' },
    options: PLACEMENTS,
  },
  overlay: {
    defaultValue: menu,
    table: {
      disable: true,
    },
  },
};
