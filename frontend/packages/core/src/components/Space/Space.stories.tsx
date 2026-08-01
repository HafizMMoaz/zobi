import { Space, type SpaceProps } from '.';

export default {
  title: 'Design System/Components/Space',
  component: Space,
};

// Sample children used in both Storybook and auto-generated docs
const SAMPLE_ITEMS = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

// Shared styling for sample items - matches docs site rendering
const sampleItemStyle = {
  padding: '8px 16px',
  background: '#e6f4ff',
  border: '1px solid #91caff',
  borderRadius: '4px',
};

export const InteractiveSpace = (args: SpaceProps) => (
  <Space {...args}>
    {SAMPLE_ITEMS.map((item, i) => (
      <div key={i} style={sampleItemStyle}>
        {item}
      </div>
    ))}
  </Space>
);

InteractiveSpace.args = {
  direction: 'horizontal',
  size: 'small',
  wrap: false,
};

InteractiveSpace.argTypes = {
  align: {
    control: { type: 'select' },
    options: ['start', 'end', 'center', 'baseline', ''],
  },
  direction: {
    control: { type: 'select' },
    options: ['vertical', 'horizontal'],
  },
  size: {
    control: { type: 'select' },
    options: ['small', 'middle', 'large'],
  },
};

InteractiveSpace.parameters = {
  docs: {
    // Inline for the static parser (can't resolve variable references)
    sampleChildren: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
    sampleChildrenStyle: {
      padding: '8px 16px',
      background: '#e6f4ff',
      border: '1px solid #91caff',
      borderRadius: '4px',
    },
    liveExample: `function Demo() {
  return (
    <Space size="small">
      {['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'].map(item => (
        <div
          key={item}
          style={{
            padding: '8px 16px',
            background: '#e6f4ff',
            border: '1px solid #91caff',
            borderRadius: 4,
          }}
        >
          {item}
        </div>
      ))}
    </Space>
  );
}`,
    examples: [
      {
        title: 'Vertical Space',
        code: `function VerticalSpace() {
  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Button buttonStyle="primary">Primary</Button>
      <Button buttonStyle="secondary">Secondary</Button>
      <Button buttonStyle="dashed">Dashed</Button>
    </Space>
  );
}`,
      },
      {
        title: 'Space Sizes',
        code: `function SpaceSizes() {
  const items = ['Item 1', 'Item 2', 'Item 3'];
  const itemStyle = {
    padding: '8px 16px',
    background: '#e6f4ff',
    border: '1px solid #91caff',
    borderRadius: 4,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {['small', 'middle', 'large'].map(size => (
        <div key={size}>
          <h4>{size}</h4>
          <Space size={size}>
            {items.map(item => (
              <div key={item} style={itemStyle}>{item}</div>
            ))}
          </Space>
        </div>
      ))}
    </div>
  );
}`,
      },
    ],
  },
};
