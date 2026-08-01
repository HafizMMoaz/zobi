import { render, screen, userEvent } from '@zobi-ui/core/spec';
import { Button, Icons, Tooltip } from '..';

test('starts hidden with default props', () => {
  render(
    <Tooltip title="Simple tooltip">
      <Button>Hover me</Button>
    </Tooltip>,
  );
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

test('renders on hover', async () => {
  render(
    <Tooltip title="Simple tooltip">
      <Button>Hover me</Button>
    </Tooltip>,
  );
  await userEvent.hover(screen.getByRole('button'));
  expect(await screen.findByRole('tooltip')).toBeInTheDocument();
});

test('renders with icon child', async () => {
  render(
    <Tooltip title="Simple tooltip">
      <Icons.WarningOutlined>Hover me</Icons.WarningOutlined>
    </Tooltip>,
  );
  await userEvent.hover(screen.getByRole('img'));
  expect(await screen.findByRole('tooltip')).toBeInTheDocument();
});
