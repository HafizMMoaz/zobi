import { Menu, MainNav } from '.';

export default {
  title: 'Components/Menu',
  component: Menu as React.FC,
  parameters: {
    docs: {
      description: {
        component:
          'Navigation menu component supporting horizontal, vertical, and inline modes. Based on Ant Design Menu with Zobi styling.',
      },
    },
  },
};

export const MainNavigation = (args: any) => (
  <MainNav
    mode="horizontal"
    items={[
      { key: 'dashboards', label: 'Dashboards', href: '/' },
      { key: 'charts', label: 'Charts', href: '/' },
      { key: 'datasets', label: 'Datasets', href: '/' },
    ]}
    {...args}
  />
);

export const InteractiveMenu = (args: any) => (
  <Menu
    items={[
      { label: 'Dashboards', key: '1' },
      { label: 'Charts', key: '2' },
      { label: 'Datasets', key: '3' },
    ]}
    {...args}
  />
);

InteractiveMenu.args = {
  mode: 'horizontal',
  selectable: true,
};

InteractiveMenu.argTypes = {
  mode: {
    control: 'select',
    options: ['horizontal', 'vertical', 'inline'],
    description:
      'Menu display mode: horizontal navbar, vertical sidebar, or inline collapsible.',
  },
  selectable: {
    control: 'boolean',
    description: 'Whether menu items can be selected.',
  },
  multiple: {
    control: 'boolean',
    description: 'Allow multiple items to be selected.',
  },
  inlineCollapsed: {
    control: 'boolean',
    description:
      'Whether the inline menu is collapsed (only applies to inline mode).',
  },
};

InteractiveMenu.parameters = {
  docs: {
    staticProps: {
      items: [
        { label: 'Dashboards', key: 'dashboards' },
        { label: 'Charts', key: 'charts' },
        { label: 'Datasets', key: 'datasets' },
        { label: 'SQL Lab', key: 'sqllab' },
      ],
    },
    liveExample: `function Demo() {
  return (
    <Menu
      mode="horizontal"
      selectable
      items={[
        { label: 'Dashboards', key: 'dashboards' },
        { label: 'Charts', key: 'charts' },
        { label: 'Datasets', key: 'datasets' },
        { label: 'SQL Lab', key: 'sqllab' },
      ]}
    />
  );
}`,
    examples: [
      {
        title: 'Vertical Menu',
        code: `function VerticalMenu() {
  return (
    <Menu
      mode="vertical"
      style={{ width: 200 }}
      items={[
        { label: 'Dashboards', key: 'dashboards' },
        { label: 'Charts', key: 'charts' },
        { label: 'Datasets', key: 'datasets' },
        {
          label: 'Settings',
          key: 'settings',
          children: [
            { label: 'Profile', key: 'profile' },
            { label: 'Preferences', key: 'preferences' },
          ],
        },
      ]}
    />
  );
}`,
      },
      {
        title: 'Menu with Icons',
        code: `function MenuWithIcons() {
  return (
    <Menu
      mode="horizontal"
      items={[
        { label: <><Icons.DashboardOutlined /> Dashboards</>, key: 'dashboards' },
        { label: <><Icons.LineChartOutlined /> Charts</>, key: 'charts' },
        { label: <><Icons.DatabaseOutlined /> Datasets</>, key: 'datasets' },
        { label: <><Icons.ConsoleSqlOutlined /> SQL Lab</>, key: 'sqllab' },
      ]}
    />
  );
}`,
      },
    ],
  },
};
