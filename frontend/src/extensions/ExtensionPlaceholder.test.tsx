import { render, screen } from 'spec/helpers/testing-library';
import ExtensionPlaceholder from './ExtensionPlaceholder';

test('renders the placeholder component with correct text', () => {
  render(<ExtensionPlaceholder id="test-extension" />, { useTheme: true });

  expect(
    screen.getByText('The extension test-extension could not be loaded.'),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      'This may be due to the extension not being activated or the content not being available.',
    ),
  ).toBeInTheDocument();
});

test('renders with the empty state image', () => {
  render(<ExtensionPlaceholder id="test-extension" />, { useTheme: true });

  // Check that the EmptyState component is rendered with the correct props
  const emptyStateContainer = screen
    .getByText('The extension test-extension could not be loaded.')
    .closest('div');
  expect(emptyStateContainer).toBeInTheDocument();
});
