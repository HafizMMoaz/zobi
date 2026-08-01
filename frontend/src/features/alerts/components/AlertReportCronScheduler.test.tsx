import { useState } from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import { AlertReportCronScheduler } from './AlertReportCronScheduler';

const defaultProps = {
  value: '0 12 * * 1',
  onChange: jest.fn(),
};

beforeEach(() => {
  defaultProps.onChange = jest.fn();
});

test('renders CronPicker by default (picker mode)', () => {
  render(<AlertReportCronScheduler {...defaultProps} />);
  expect(screen.getByText('Schedule type')).toBeInTheDocument();
  expect(screen.getByText('Schedule')).toBeInTheDocument();
  // CronPicker renders combobox elements; CRON text input does not
  expect(
    screen.queryByPlaceholderText('CRON expression'),
  ).not.toBeInTheDocument();
});

async function switchToCronInputMode() {
  const scheduleTypeSelect = screen.getByRole('combobox', {
    name: /Schedule type/i,
  });
  fireEvent.mouseDown(scheduleTypeSelect);
  await waitFor(() => {
    expect(screen.getByText('CRON Schedule')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText('CRON Schedule'));
}

test('switches to CRON input mode and shows text input', async () => {
  render(<AlertReportCronScheduler {...defaultProps} />);

  await switchToCronInputMode();

  await waitFor(() => {
    expect(screen.getByPlaceholderText('CRON expression')).toBeInTheDocument();
  });
});

// Controlled wrapper: the component is fully controlled (value from props),
// so blur/enter tests need a parent that updates value on onChange.
function ControlledScheduler({
  initialValue,
  onChangeSpy,
}: {
  initialValue: string;
  onChangeSpy: jest.Mock;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <AlertReportCronScheduler
      value={value}
      onChange={(v: string) => {
        setValue(v);
        onChangeSpy(v);
      }}
    />
  );
}

test('calls onChange on blur in CRON input mode', async () => {
  const onChangeSpy = jest.fn();
  render(
    <ControlledScheduler initialValue="0 12 * * 1" onChangeSpy={onChangeSpy} />,
  );

  await switchToCronInputMode();

  const input = await screen.findByPlaceholderText('CRON expression');
  fireEvent.change(input, { target: { value: '*/5 * * * *' } });

  // Clear spy so we only assert the blur-specific call
  onChangeSpy.mockClear();
  fireEvent.blur(input);

  expect(onChangeSpy).toHaveBeenCalledTimes(1);
  expect(onChangeSpy).toHaveBeenCalledWith('*/5 * * * *');
});

test('calls onChange on Enter key press in CRON input mode', async () => {
  const onChangeSpy = jest.fn();
  render(
    <ControlledScheduler initialValue="0 12 * * 1" onChangeSpy={onChangeSpy} />,
  );

  await switchToCronInputMode();

  const input = await screen.findByPlaceholderText('CRON expression');
  fireEvent.change(input, { target: { value: '0 9 * * 1-5' } });

  // Clear spy so we only assert the Enter-specific call
  onChangeSpy.mockClear();
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  expect(onChangeSpy).toHaveBeenCalledTimes(1);
  expect(onChangeSpy).toHaveBeenCalledWith('0 9 * * 1-5');
});
