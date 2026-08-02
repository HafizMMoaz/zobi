import { render, screen } from 'spec/helpers/testing-library';
import { GenericLink } from '.';

test('renders', () => {
  render(<GenericLink to="/explore">Link to Explore</GenericLink>, {
    useRouter: true,
  });
  expect(screen.getByText('Link to Explore')).toBeVisible();
});

test('navigates to internal URL', () => {
  render(<GenericLink to="/explore">Link to Explore</GenericLink>, {
    useRouter: true,
  });
  const internalLink = screen.getByTestId('internal-link');
  expect(internalLink).toHaveAttribute('href', '/explore');
});

test('navigates to external URL', () => {
  render(
    <GenericLink to="https://zobi.dev/">Link to external website</GenericLink>,
    { useRouter: true },
  );
  const externalLink = screen.getByTestId('external-link');
  expect(externalLink).toHaveAttribute('href', 'https://zobi.dev/');
});

test('navigates to external URL without host', () => {
  render(<GenericLink to="zobi.dev/">Link to external website</GenericLink>, {
    useRouter: true,
  });
  const externalLink = screen.getByTestId('external-link');
  expect(externalLink).toHaveAttribute('href', '//zobi.dev/');
});
