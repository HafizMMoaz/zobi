import type { DatePickerProps, RangePickerProps } from './types';
import { DatePicker, RangePicker } from '.';

export default {
  title: 'Components/DatePicker',
  component: DatePicker,
};

const commonArgs: DatePickerProps = {
  allowClear: false,
  autoFocus: true,
  disabled: false,
  format: 'YYYY-MM-DD hh:mm a',
  inputReadOnly: false,
  order: true,
  picker: 'date',
  placement: 'bottomLeft',
  size: 'middle',
  showNow: true,
  showTime: { format: 'hh:mm a' },
};

const interactiveTypes = {
  mode: { disabled: true },
  picker: {
    control: {
      type: 'select',
    },
    options: ['', 'date', 'week', 'month', 'quarter', 'year'],
  },
  size: {
    control: {
      type: 'select',
    },
    options: ['large', 'middle', 'small'],
  },
  placement: {
    control: {
      type: 'select',
    },
    options: ['bottomLeft', 'bottomRight', 'topLeft', 'topRight'],
  },
  status: {
    control: {
      type: 'select',
    },
    options: ['error', 'warning'],
  },

  variant: {
    control: {
      type: 'select',
    },
    options: ['outlined', 'borderless', 'filled'],
  },
};

export const InteractiveDatePicker: any = (args: DatePickerProps) => (
  <DatePicker {...args} />
);

InteractiveDatePicker.args = {
  ...commonArgs,
  placeholder: 'Placeholder',
  showNow: true,
  showTime: { format: 'hh:mm a', needConfirm: false },
};

InteractiveDatePicker.argTypes = {
  ...interactiveTypes,
  showNow: {
    description: 'Show "Now" button to select current date and time.',
    control: 'boolean',
  },
};

InteractiveDatePicker.parameters = {
  actions: {
    disable: true,
  },
  docs: {
    description: {
      story: 'A date picker component with time selection support.',
    },
    staticProps: {
      allowClear: false,
      autoFocus: true,
      disabled: false,
      format: 'YYYY-MM-DD hh:mm a',
      inputReadOnly: false,
      picker: 'date',
      placement: 'bottomLeft',
      size: 'middle',
      showNow: true,
      placeholder: 'Select date',
      showTime: { format: 'hh:mm a', needConfirm: false },
    },
    liveExample: `function Demo() {
  return (
    <DatePicker
      placeholder="Select date"
      format="YYYY-MM-DD hh:mm a"
      showNow
      showTime={{ format: 'hh:mm a', needConfirm: false }}
    />
  );
}`,
  },
};

export const InteractiveRangePicker = (
  args: Omit<RangePickerProps, 'picker'> & {
    picker?: 'date';
  },
) => <RangePicker {...args} />;

InteractiveRangePicker.args = {
  ...commonArgs,
  separator: '-',
  showTime: { format: 'hh:mm a', needConfirm: false },
};

InteractiveRangePicker.argTypes = interactiveTypes;
