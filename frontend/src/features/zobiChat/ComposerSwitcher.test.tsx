import { render, screen, within } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import ComposerSwitcher from './ComposerSwitcher';
import { ChatModel, ModeOption } from './types';

const MODES: ModeOption[] = [
  { value: 'manual', label: 'Ask before changes', description: '' },
  { value: 'auto', label: 'Auto', description: '' },
];

const MODELS: ChatModel[] = [
  { alias: 'fast', is_default: false },
  { alias: 'gpt-4o', is_default: true },
];

const noop = () => {};

test('shows the effective model as the trigger label when models are configured', async () => {
  render(
    <ComposerSwitcher
      modes={MODES}
      mode="manual"
      onModeChange={noop}
      models={MODELS}
      threadModel="fast"
      onThreadModelChange={noop}
      onceModel={null}
      onOnceModelChange={noop}
    />,
  );

  expect(
    await screen.findByRole('button', { name: 'Switch mode and model' }),
  ).toHaveTextContent('fast');
});

test('falls back to the mode label when no models are configured', async () => {
  render(
    <ComposerSwitcher
      modes={MODES}
      mode="manual"
      onModeChange={noop}
      models={[]}
      threadModel={null}
      onThreadModelChange={noop}
      onceModel={null}
      onOnceModelChange={noop}
    />,
  );

  expect(
    await screen.findByRole('button', { name: 'Switch mode and model' }),
  ).toHaveTextContent('Ask before changes');
});

test('hides the model sections when no models are configured', async () => {
  render(
    <ComposerSwitcher
      modes={MODES}
      mode="manual"
      onModeChange={noop}
      models={[]}
      threadModel={null}
      onThreadModelChange={noop}
      onceModel={null}
      onOnceModelChange={noop}
    />,
  );

  await userEvent.click(
    await screen.findByRole('button', { name: 'Switch mode and model' }),
  );

  expect(
    await screen.findByRole('group', { name: 'Mode' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('group', { name: 'Model' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('group', { name: 'This message only' }),
  ).not.toBeInTheDocument();
});

test('picking a mode applies it and closes the menu', async () => {
  const onModeChange = jest.fn();
  render(
    <ComposerSwitcher
      modes={MODES}
      mode="manual"
      onModeChange={onModeChange}
      models={[]}
      threadModel={null}
      onThreadModelChange={noop}
      onceModel={null}
      onOnceModelChange={noop}
    />,
  );

  await userEvent.click(
    await screen.findByRole('button', { name: 'Switch mode and model' }),
  );
  const modeGroup = await screen.findByRole('group', { name: 'Mode' });
  await userEvent.click(within(modeGroup).getByText('Auto'));

  expect(onModeChange).toHaveBeenCalledWith('auto');
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

test('picking a thread model applies it and closes the menu', async () => {
  const onThreadModelChange = jest.fn();
  render(
    <ComposerSwitcher
      modes={MODES}
      mode="manual"
      onModeChange={noop}
      models={MODELS}
      threadModel={null}
      onThreadModelChange={onThreadModelChange}
      onceModel={null}
      onOnceModelChange={noop}
    />,
  );

  await userEvent.click(
    await screen.findByRole('button', { name: 'Switch mode and model' }),
  );
  const modelGroup = await screen.findByRole('group', { name: 'Model' });
  await userEvent.click(within(modelGroup).getByText('fast'));

  expect(onThreadModelChange).toHaveBeenCalledWith('fast');
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

test('clearing the once override reports null', async () => {
  const onOnceModelChange = jest.fn();
  render(
    <ComposerSwitcher
      modes={MODES}
      mode="manual"
      onModeChange={noop}
      models={MODELS}
      threadModel={null}
      onThreadModelChange={noop}
      onceModel="fast"
      onOnceModelChange={onOnceModelChange}
    />,
  );

  await userEvent.click(
    await screen.findByRole('button', { name: 'Switch mode and model' }),
  );
  const onceGroup = await screen.findByRole('group', {
    name: 'This message only',
  });
  await userEvent.click(within(onceGroup).getByText('None'));

  expect(onOnceModelChange).toHaveBeenCalledWith(null);
});
