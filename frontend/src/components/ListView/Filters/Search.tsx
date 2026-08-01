import {
  forwardRef,
  useImperativeHandle,
  useState,
  RefObject,
  ChangeEvent,
} from 'react';

import { t } from '@zobi/core/translation';
import { useTheme } from '@zobi/core/theme';
import {
  Input,
  InfoTooltip,
  FormLabel,
  Icons,
  Flex,
} from '@zobi-ui/core/components';
import type { BaseFilter, FilterHandler } from './types';
import { FilterContainer } from './Base';
import { SELECT_WIDTH } from '../utils';

interface SearchHeaderProps extends BaseFilter {
  Header: string;
  onSubmit: (val: string) => void;
  name: string;
  toolTipDescription: string | undefined;
  autoComplete?: string;
}

function SearchFilter(
  {
    Header,
    name,
    initialValue,
    toolTipDescription,
    onSubmit,
    autoComplete = 'off',
  }: SearchHeaderProps,
  ref: RefObject<FilterHandler>,
) {
  const theme = useTheme();
  const [value, setValue] = useState(initialValue || '');
  const handleSubmit = () => {
    if (value) {
      onSubmit(value.trim());
    }
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
    if (e.currentTarget.value === '') {
      onSubmit('');
    }
  };

  useImperativeHandle(ref, () => ({
    clearFilter: () => {
      setValue('');
      onSubmit('');
    },
  }));

  return (
    <FilterContainer
      data-test="search-filter-container"
      width={SELECT_WIDTH}
      vertical
      justify="center"
      align="start"
    >
      <Flex>
        <FormLabel>{Header}</FormLabel>
        {toolTipDescription && <InfoTooltip tooltip={toolTipDescription} />}
      </Flex>
      <Input
        allowClear
        data-test="filters-search"
        placeholder={t('Type a value')}
        autoComplete={autoComplete}
        name={name}
        value={value}
        onChange={handleChange}
        onPressEnter={handleSubmit}
        onBlur={handleSubmit}
        prefix={
          <Icons.SearchOutlined iconColor={theme.colorIcon} iconSize="l" />
        }
      />
    </FilterContainer>
  );
}

export default forwardRef(SearchFilter);
