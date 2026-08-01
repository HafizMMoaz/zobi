import { render, screen, userEvent, waitFor } from '@zobi.dev/core/spec';
import { CertifiedBadge } from '.';
import type { CertifiedBadgeProps } from './types';

const asyncRender = (props?: CertifiedBadgeProps) =>
  waitFor(() => render(<CertifiedBadge {...props} />));

test('renders with default props', async () => {
  await asyncRender();
  expect(screen.getByRole('img')).toBeInTheDocument();
});

test('renders a tooltip when hovered', async () => {
  await asyncRender();
  await userEvent.hover(screen.getByRole('img'));
  expect(await screen.findByRole('tooltip')).toBeInTheDocument();
});

test('renders with certified by', async () => {
  const certifiedBy = 'Trusted Authority';
  await asyncRender({ certifiedBy });
  await userEvent.hover(screen.getByRole('img'));
  expect(await screen.findByRole('tooltip')).toHaveTextContent(certifiedBy);
});

test('renders with details', async () => {
  const details = 'All requirements have been met.';
  await asyncRender({ details });
  await userEvent.hover(screen.getByRole('img'));
  expect(await screen.findByRole('tooltip')).toHaveTextContent(details);
});
