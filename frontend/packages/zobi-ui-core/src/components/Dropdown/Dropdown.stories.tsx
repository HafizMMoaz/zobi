import { Menu } from '@zobi-ui/core/components/Menu';
import { MenuDotsDropdown } from '.';
import type { MenuDotsDropdownProps } from './types';

export default {
  title: 'Components/Dropdown',
};

const menu = (
  <Menu
    items={[
      { label: 'Menu Item 1', key: '1' },
      { label: 'Menu Item 2', key: '2' },
      { label: 'Menu Item 3', key: '3' },
    ]}
  />
);

const customOverlay = (
  <div
    style={{
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'yellow',
      width: 100,
      height: 100,
    }}
  >
    Custom overlay
  </div>
);

export const InteractiveDropdown = ({
  overlayType,
  ...rest
}: MenuDotsDropdownProps & { overlayType: string }) => (
  <MenuDotsDropdown
    {...rest}
    overlay={overlayType === 'custom' ? customOverlay : menu}
  />
);

InteractiveDropdown.argTypes = {
  overlayType: {
    defaultValue: 'menu',
    control: { type: 'radio' },
    options: ['menu', 'custom'],
  },
};
