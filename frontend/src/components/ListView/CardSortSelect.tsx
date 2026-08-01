import { useState, useMemo } from 'react';
import { t } from '@zobi/core/translation';
import { styled } from '@zobi/core/theme';
import { FormLabel, Select } from '@zobi-ui/core/components';
import { SELECT_WIDTH } from './utils';
import { CardSortSelectOption, SortColumn } from './types';

const SortContainer = styled.div`
  display: inline-flex;
  font-size: ${({ theme }) => theme.fontSizeSM}px;
  align-items: center;
  text-align: left;
  width: ${SELECT_WIDTH}px;
`;

interface CardViewSelectSortProps {
  onChange: (value: SortColumn[]) => void;
  options: Array<CardSortSelectOption>;
  initialSort?: SortColumn[];
}

export const CardSortSelect = ({
  initialSort,
  onChange,
  options,
}: CardViewSelectSortProps) => {
  const defaultSort =
    (initialSort &&
      options.find(
        ({ id, desc }) =>
          id === initialSort[0].id && desc === initialSort[0].desc,
      )) ||
    options[0];

  const [value, setValue] = useState({
    label: defaultSort.label,
    value: defaultSort.value,
  });

  const formattedOptions = useMemo(
    () => options.map(option => ({ label: option.label, value: option.value })),
    [options],
  );

  const handleOnChange = (selected: { label: string; value: string }) => {
    setValue(selected);
    const originalOption = options.find(
      ({ value }) => value === selected.value,
    );
    if (originalOption) {
      const sortBy = [
        {
          id: originalOption.id,
          desc: originalOption.desc,
        },
      ];
      onChange(sortBy);
    }
  };

  return (
    <SortContainer>
      <Select
        ariaLabel={t('Sort')}
        header={<FormLabel>{t('Sort')}</FormLabel>}
        labelInValue
        onChange={handleOnChange}
        options={formattedOptions}
        showSearch
        value={value}
        data-test="card-sort-select"
      />
    </SortContainer>
  );
};
