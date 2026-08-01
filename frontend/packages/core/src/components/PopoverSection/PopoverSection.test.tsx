import { render, screen, userEvent } from '@zobi.dev/core/spec';
import PopoverSection from '.';

test('renders with default props', async () => {
  render(
    <PopoverSection title="Title">
      <div role="form" />
    </PopoverSection>,
  );
  expect(await screen.findByRole('form')).toBeInTheDocument();
  expect((await screen.findAllByRole('img')).length).toBe(1);
});

test('renders tooltip icon', async () => {
  render(
    <PopoverSection title="Title" info="Tooltip">
      <div role="form" />
    </PopoverSection>,
  );
  expect((await screen.findAllByRole('img')).length).toBe(2);
});

test('renders a tooltip when hovered', async () => {
  render(
    <PopoverSection title="Title" info="Tooltip">
      <div role="form" />
    </PopoverSection>,
  );
  await userEvent.hover(screen.getAllByRole('img')[0]);
  expect(await screen.findByRole('tooltip')).toBeInTheDocument();
});

test('calls onSelect when clicked', async () => {
  const onSelect = jest.fn();
  render(
    <PopoverSection title="Title" onSelect={onSelect}>
      <div role="form" />
    </PopoverSection>,
  );
  await userEvent.click(await screen.findByRole('img'));
  expect(onSelect).toHaveBeenCalled();
});
