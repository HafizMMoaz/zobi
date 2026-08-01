import { sharedControlComponents } from '@zobi.dev/chart-controls';
import { Input, InputNumber, Select } from '@zobi.dev/core/components';
import Slider from '@zobi.dev/core/components/Slider';
import CurrencyControl from '../../CurrencyControl';
import CheckboxControl from '../../CheckboxControl';

export const ControlFormItemComponents = {
  Slider,
  InputNumber,
  Input,
  Select,
  // Directly export Checkbox will result in "using name from external module" error
  // ref: https://stackoverflow.com/questions/43900035/ts4023-exported-variable-x-has-or-is-using-name-y-from-external-module-but
  Checkbox: CheckboxControl,
  RadioButtonControl: sharedControlComponents.RadioButtonControl,
  CurrencyControl,
};
