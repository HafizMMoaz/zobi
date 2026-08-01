import { useState, useCallback, useEffect } from 'react';
import { Divider } from '../Divider';
import { Input } from '../Input';
import { CronPicker } from '.';
import type { CronError, CronProps } from './types';

export default {
  title: 'Components/CronPicker',
  component: CronPicker,
};

export const InteractiveCronPicker = (props: CronProps) => {
  const [value, setValue] = useState(props.value);
  useEffect(() => {
    setValue(props.value);
  }, [props.value]);
  const customSetValue = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);
  const [error, onError] = useState<CronError>();

  return (
    <div>
      <Input
        value={value}
        onBlur={event => {
          setValue(event.target.value);
        }}
        onChange={e => setValue(e.target.value || '')}
      />
      <Divider />
      <CronPicker
        {...props}
        value={value}
        setValue={customSetValue}
        onError={onError}
      />
      {error && <p style={{ marginTop: 20 }}>Error: {error.description}</p>}
    </div>
  );
};

InteractiveCronPicker.args = {
  clearButton: false,
  disabled: false,
  readOnly: false,
};

InteractiveCronPicker.argTypes = {
  value: {
    defaultValue: '30 5 * * *',
    table: {
      disable: true,
    },
  },
  theme: {
    table: {
      disable: true,
    },
  },
};
