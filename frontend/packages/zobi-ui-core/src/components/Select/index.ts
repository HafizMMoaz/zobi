import Select from './Select';
import AsyncSelect from './AsyncSelect';

export { Select, AsyncSelect };
export * from './types';
export * from './styles';
export * from './constants';

// TODO hack to provide vanilla antd Select and SelectProps as
// we mutated the interface quite a bit here, and some internal packages
// are still using the vanilla antd Select
export { Select as RawAntdSelect } from 'antd';
export { type SelectProps as RawAntdSelectProps } from 'antd/es/select';
