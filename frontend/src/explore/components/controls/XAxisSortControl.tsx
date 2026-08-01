import { useEffect, useState } from 'react';
import SelectControl from './SelectControl';

interface XAxisSortControlProps {
  onChange: (val: string | undefined) => void;
  value: string | null;
  shouldReset: boolean;
  name?: string;
  [key: string]: unknown;
}

export default function XAxisSortControl(props: XAxisSortControlProps) {
  const [value, setValue] = useState(props.value);
  useEffect(() => {
    if (props.shouldReset) {
      props.onChange(undefined);
      setValue(null);
    }
  }, [props.shouldReset, props.value]);

  return (
    <SelectControl
      {...props}
      name={props.name ?? 'x_axis_sort'}
      value={value}
    />
  );
}
