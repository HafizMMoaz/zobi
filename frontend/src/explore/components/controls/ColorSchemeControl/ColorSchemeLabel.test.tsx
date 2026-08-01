import { render, screen, waitFor } from 'spec/helpers/testing-library';
import ColorSchemeLabel from './ColorSchemeLabel';

const defaultProps = {
  colors: [
    '#000000',
    '#FFFFFF',
    '#CCCCCC',
    '#000000',
    '#FFFFFF',
    '#CCCCCC',
    '#000000',
    '#FFFFFF',
    '#CCCCCC',
    '#000000',
    '#FFFFFF',
    '#CCCCCC',
  ],
  label: 'Zobi Colors',
  id: 'colorScheme',
};

const setup = (overrides?: Record<string, any>) =>
  render(<ColorSchemeLabel {...defaultProps} {...overrides} />);

test('should render', async () => {
  const { container } = setup();
  await waitFor(() => expect(container).toBeVisible());
});

test('should render the label', () => {
  setup();
  expect(screen.getByText('Zobi Colors')).toBeInTheDocument();
});

test('should render the colors', () => {
  setup();
  const allColors = screen.getAllByTestId('color');
  expect(allColors).toHaveLength(12);
});
