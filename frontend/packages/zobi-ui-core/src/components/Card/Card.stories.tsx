import { Card } from '.';
import type { CardProps } from './types';

export default {
  title: 'Components/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'A container component for grouping related content. ' +
          'Supports titles, borders, loading states, and hover effects.',
      },
    },
  },
};

export const InteractiveCard = (args: CardProps) => <Card {...args} />;

InteractiveCard.args = {
  padded: true,
  title: 'Dashboard Overview',
  children:
    'This card displays a summary of your dashboard metrics and recent activity.',
  bordered: true,
  loading: false,
  hoverable: false,
};

InteractiveCard.argTypes = {
  padded: {
    control: { type: 'boolean' },
    description: 'Whether the card content has padding.',
  },
  title: {
    control: { type: 'text' },
    description: 'Title text displayed at the top of the card.',
  },
  children: {
    control: { type: 'text' },
    description: 'The content inside the card.',
  },
  bordered: {
    control: { type: 'boolean' },
    description: 'Whether to show a border around the card.',
  },
  loading: {
    control: { type: 'boolean' },
    description: 'Whether to show a loading skeleton.',
  },
  hoverable: {
    control: { type: 'boolean' },
    description: 'Whether the card lifts on hover.',
  },
  onClick: {
    table: { disable: true },
    action: 'onClick',
  },
  theme: {
    table: { disable: true },
  },
};

InteractiveCard.parameters = {
  docs: {
    liveExample: `function Demo() {
  return (
    <Card title="Dashboard Overview" bordered>
      This card displays a summary of your dashboard metrics and recent activity.
    </Card>
  );
}`,
    examples: [
      {
        title: 'Card States',
        code: `function CardStates() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <Card title="Default" bordered style={{ width: 250 }}>
        Default card content.
      </Card>
      <Card title="Hoverable" bordered hoverable style={{ width: 250 }}>
        Hover over this card.
      </Card>
      <Card title="Loading" bordered loading style={{ width: 250 }}>
        This content is hidden while loading.
      </Card>
      <Card title="No Border" style={{ width: 250 }}>
        Borderless card.
      </Card>
    </div>
  );
}`,
      },
    ],
  },
};
