import { render, screen } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import ModelPicker from './ModelPicker';
import { ChatModel } from './types';

const MODELS: ChatModel[] = [
  { alias: 'fast', is_default: false },
  { alias: 'gpt-4o', is_default: true },
];

test('renders nothing when no models are configured', () => {
  const { container } = render(
    <ModelPicker models={[]} value={null} onChange={jest.fn()} label="Model" />,
  );

  expect(container).toBeEmptyDOMElement();
});

test('marks the default alias', async () => {
  render(
    <ModelPicker
      models={MODELS}
      value={null}
      onChange={jest.fn()}
      label="Model"
    />,
  );

  // getByLabelText('Model') is ambiguous here: antd's outer wrapper div and
  // the inner search input both carry aria-label="Model". Querying by role
  // instead matches this codebase's own selectOption helper in
  // spec/helpers/testing-library.tsx.
  await userEvent.click(screen.getByRole('combobox', { name: 'Model' }));

  expect(await screen.findByText('gpt-4o (default)')).toBeInTheDocument();
});

test('choosing an alias reports it', async () => {
  const onChange = jest.fn();
  render(
    <ModelPicker
      models={MODELS}
      value={null}
      onChange={onChange}
      label="Model"
    />,
  );

  await userEvent.click(screen.getByRole('combobox', { name: 'Model' }));
  await userEvent.click(await screen.findByText('fast'));

  expect(onChange).toHaveBeenCalledWith('fast');
});

test('clearing reports null, meaning fall back to the default', async () => {
  const onChange = jest.fn();
  render(
    <ModelPicker
      models={MODELS}
      value="fast"
      onChange={onChange}
      label="Model"
    />,
  );

  // The wrapper's clear icon is antd's CloseCircleFilled, whose accessible
  // name is "close-circle" rather than "clear" (confirmed against this
  // repo's own Select.test.tsx, which uses the same query).
  await userEvent.click(screen.getByLabelText('close-circle'));

  expect(onChange).toHaveBeenCalledWith(null);
});
