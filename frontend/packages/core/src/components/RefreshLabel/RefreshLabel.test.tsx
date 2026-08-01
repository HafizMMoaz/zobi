import { render, screen, userEvent } from '@zobi.dev/core/spec';
import RefreshLabel from '@zobi.dev/core/components/RefreshLabel';

test('renders with default props', async () => {
  render(<RefreshLabel tooltipContent="Tooltip" onClick={jest.fn()} />);
  const refresh = await screen.findByRole('button');
  expect(refresh).toBeInTheDocument();
  await userEvent.hover(refresh);
});

test('renders tooltip on hover', async () => {
  const tooltipText = 'Tooltip';
  render(<RefreshLabel tooltipContent={tooltipText} onClick={jest.fn()} />);
  const refresh = screen.getByRole('button');
  await userEvent.hover(refresh);
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(tooltip).toHaveTextContent(tooltipText);
});

test('triggers on click event', async () => {
  const onClick = jest.fn();
  render(<RefreshLabel tooltipContent="Tooltip" onClick={onClick} />);
  const refresh = await screen.findByRole('button');
  await userEvent.click(refresh);
  expect(onClick).toHaveBeenCalled();
});
