import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { DeckglLayerVisibilityTooltip } from './FilterControlShared';

test('renders DeckglLayerVisibilityTooltip with icon button', () => {
  render(<DeckglLayerVisibilityTooltip />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('shows tooltip content on hover for DeckglLayerVisibilityTooltip', async () => {
  render(<DeckglLayerVisibilityTooltip />);
  userEvent.hover(screen.getByRole('button'));
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toHaveTextContent(
    'Choose layers to hide from all deck.gl Multiple Layer charts in this dashboard.',
  );
});
