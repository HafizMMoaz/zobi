import { useArgs } from '@storybook/preview-api';
import TimezoneSelector, { TimezoneSelectorProps } from './index';

export default {
  title: 'Components/TimezoneSelector',
  component: TimezoneSelector,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const InteractiveTimezoneSelector = (args: TimezoneSelectorProps) => {
  const [{ timezone }, updateArgs] = useArgs();
  const onTimezoneChange = (value: string) => {
    updateArgs({ timezone: value });
  };
  return (
    <TimezoneSelector timezone={timezone} onTimezoneChange={onTimezoneChange} />
  );
};

InteractiveTimezoneSelector.args = {
  timezone: 'America/Los_Angeles',
};
