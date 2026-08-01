import { useEffect, useState } from 'react';
import { t } from '@zobi/core/translation';
import { ZobiClient, getClientErrorObject } from '@zobi-ui/core';
import ControlHeader from 'src/explore/components/ControlHeader';
import {
  Select,
  type SelectValue,
  type LabeledValue,
  type SelectOptionsType,
  type SelectProps,
} from '@zobi-ui/core/components';
import withToasts from 'src/components/MessageToasts/withToasts';

type SelectAsyncProps = Omit<SelectProps, 'options' | 'ariaLabel' | 'onChange'>;

interface SelectAsyncControlProps extends SelectAsyncProps {
  addDangerToast: (error: string) => void;
  ariaLabel?: string;
  dataEndpoint: string;
  default?: SelectValue;
  mutator?: (
    response: Record<string, any>,
    value: SelectValue | undefined,
  ) => SelectOptionsType;
  multi?: boolean;
  onChange: (val: SelectValue) => void;
  // ControlHeader related props
  description?: string;
  hovered?: boolean;
  label?: string;
}

function isLabeledValue(arg: unknown): arg is LabeledValue {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'value' in arg &&
    arg.value !== undefined
  );
}

const SelectAsyncControl = ({
  addDangerToast,
  allowClear = true,
  ariaLabel,
  dataEndpoint,
  multi = true,
  mutator,
  onChange,
  placeholder,
  value,
  ...props
}: SelectAsyncControlProps) => {
  const [options, setOptions] = useState<SelectOptionsType>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [rawData, setRawData] = useState<Record<string, unknown> | null>(null);

  const handleOnChange = (val: SelectValue) => {
    let onChangeVal = val;
    if (Array.isArray(val)) {
      const values = val.map(v => (isLabeledValue(v) ? v.value : v));
      onChangeVal = values;
    }
    if (isLabeledValue(val)) {
      onChangeVal = val.value;
    }
    onChange(onChangeVal);
  };

  const getValue = () => {
    const currentValue =
      value || (props.default !== undefined ? props.default : undefined);

    // safety check - the value is intended to be undefined but null was used
    if (currentValue === null && !options.some(o => o.value === null)) {
      return undefined;
    }
    return currentValue;
  };

  useEffect(() => {
    const onError = (response: Response) =>
      getClientErrorObject(response).then(e => {
        const { error } = e;
        addDangerToast(t('Error while fetching data: %s', error));
      });
    const loadOptions = () =>
      ZobiClient.get({
        endpoint: dataEndpoint,
      })
        .then(response => {
          setRawData(response.json);
          const data = mutator
            ? mutator(response.json, value)
            : response.json.result;
          setOptions(data);
        })
        .catch(onError)
        .finally(() => {
          setLoaded(true);
        });

    if (!loaded) {
      loadOptions();
    }
  }, [addDangerToast, dataEndpoint, mutator, value, loaded]);

  useEffect(() => {
    if (rawData && mutator) {
      const data = mutator(rawData, value);
      setOptions(data);
    }
  }, [value, mutator, rawData]);

  return (
    <Select
      allowClear={allowClear}
      ariaLabel={ariaLabel || t('Select ...')}
      value={getValue()}
      header={<ControlHeader {...props} />}
      mode={multi ? 'multiple' : 'single'}
      onChange={handleOnChange}
      options={options}
      placeholder={placeholder}
    />
  );
};

export default withToasts(SelectAsyncControl);
