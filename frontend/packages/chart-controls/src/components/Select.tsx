import { useState, ReactNode } from 'react';
import {
  RawAntdSelect as AntdSelect,
  type RawAntdSelectProps as AntdSelectProps,
} from '@zobi.dev/core/components';

export const { Option }: any = AntdSelect;

export type SelectOption<VT = string> = [VT, ReactNode];

export type SelectProps<VT> = Omit<AntdSelectProps<VT>, 'options'> & {
  creatable?: boolean;
  minWidth?: string | number;
  options?: SelectOption<VT>[];
};

/**
 * AntD select with creatable options.
 */
export default function Select<VT extends string | number>({
  creatable,
  onSearch,
  popupMatchSelectWidth = false,
  minWidth = '100%',
  showSearch: showSearch_ = true,
  onChange,
  options,
  children,
  value,
  ...props
}: SelectProps<VT>) {
  const [searchValue, setSearchValue] = useState<string>();
  // force show search if creatable
  const showSearch = showSearch_ || creatable;
  const handleSearch = showSearch
    ? (input: string) => {
        if (creatable) {
          setSearchValue(input);
        }
        if (onSearch) {
          onSearch(input);
        }
      }
    : undefined;

  const optionsHasSearchValue = options?.some(([val]) => val === searchValue);
  const optionsHasValue = options?.some(([val]) => val === value);

  const handleChange: SelectProps<VT>['onChange'] = showSearch
    ? (val, opt) => {
        // reset input value once selected
        setSearchValue('');
        if (onChange) {
          onChange(val, opt);
        }
      }
    : onChange;

  return (
    <AntdSelect<VT>
      popupMatchSelectWidth={popupMatchSelectWidth}
      showSearch={showSearch}
      onSearch={handleSearch}
      onChange={handleChange}
      value={value}
      {...props}
      css={{
        minWidth,
      }}
    >
      {options?.map(([val, label]) => (
        <Option value={val}>{label}</Option>
      ))}
      {children}
      {value && !optionsHasValue && (
        <Option key={value} value={value}>
          {value}
        </Option>
      )}
      {searchValue && !optionsHasSearchValue && (
        <Option key={searchValue} value={searchValue}>
          {/* Unfortunately AntD select does not support displaying different
          label for option vs select value, so we can't use
          `t('Create "%s"', searchValue)` here */}
          {searchValue}
        </Option>
      )}
    </AntdSelect>
  );
}

Select.Option = Option;
