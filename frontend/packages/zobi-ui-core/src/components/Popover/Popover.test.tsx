import { render, screen, userEvent, waitFor } from '@zobi-ui/core/spec';
import { Icons, Popover } from '..';
import { Button } from '../Button';

test('should render', () => {
  const { container } = render(<Popover />);
  expect(container).toBeInTheDocument();
});

test('should render a title when visible', () => {
  render(<Popover title="Popover title" open />);
  expect(screen.getByText('Popover title')).toBeInTheDocument();
});

test('should render some content when visible', () => {
  render(<Popover content="Content sample" open />);
  expect(screen.getByText('Content sample')).toBeInTheDocument();
});

test('it should not render a title or content when not visible', () => {
  render(<Popover content="Content sample" title="Popover title" />);
  const content = screen.queryByText('Content sample');
  const title = screen.queryByText('Popover title');
  expect(content).not.toBeInTheDocument();
  expect(title).not.toBeInTheDocument();
});

test('it should render content when not visible but forceRender=true', () => {
  render(<Popover content="Content sample" forceRender />);
  expect(screen.getByText('Content sample')).toBeInTheDocument();
});

test('renders with icon child', async () => {
  render(
    <Popover content="Content sample" title="Popover title">
      <Icons.WarningOutlined>Click me</Icons.WarningOutlined>
    </Popover>,
  );
  expect(await screen.findByRole('img')).toBeInTheDocument();
});

test('fires an event when visibility is changed', async () => {
  const onOpenChange = jest.fn();
  render(
    <Popover
      content="Content sample"
      title="Popover title"
      onOpenChange={onOpenChange}
    >
      <Button>Hover me</Button>
    </Popover>,
  );
  await userEvent.hover(screen.getByRole('button'));
  await waitFor(() => expect(onOpenChange).toHaveBeenCalledTimes(1));
});
