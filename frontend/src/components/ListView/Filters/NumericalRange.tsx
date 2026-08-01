import { useState, forwardRef, useImperativeHandle, RefObject } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import { InputNumber } from '@zobi.dev/core/components/Input';
import { FormLabel } from '@zobi.dev/core/components/Form';
import type { BaseFilter, FilterHandler } from './types';
import { FilterContainer } from './Base';
import { RANGE_WIDTH } from '../utils';

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
`;

const StyledDivider = styled.span`
  margin: 0 ${({ theme }) => theme.sizeUnit * 2}px;
  color: ${({ theme }) => theme.colorText};
  font-weight: ${({ theme }) => theme.fontWeightNormal};
  font-size: ${({ theme }) => theme.fontSize}px;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colorErrorText};
  font-size: ${({ theme }) => theme.fontSizeSM}px;
  font-weight: ${({ theme }) => theme.fontWeightNormal};
  position: absolute;
  bottom: -50%;
  left: 0;
`;

interface NumericalRangeFilterProps extends BaseFilter {
  onSubmit: (val: [number | null, number | null]) => void;
  name: string;
  min?: number;
  max?: number;
}

function NumericalRangeFilter(
  { Header, initialValue, onSubmit }: NumericalRangeFilterProps,
  ref: RefObject<FilterHandler>,
) {
  const [value, setValue] = useState<[number | null, number | null]>(
    initialValue ?? [null, null],
  );
  const [hasError, setHasError] = useState(false);

  const handleMinChange = (newMin: number | null) => {
    const newValue: [number | null, number | null] = [newMin, value[1]];
    setValue(newValue);

    if (newMin !== null && value[1] !== null && newMin >= value[1]) {
      setHasError(true);
      return;
    }

    setHasError(false);
    onSubmit(newValue);
  };
  const handleMaxChange = (newMax: number | null) => {
    const newValue: [number | null, number | null] = [value[0], newMax];
    setValue(newValue);

    if (value[0] !== null && newMax !== null && value[0] >= newMax) {
      setHasError(true);
      return;
    }

    setHasError(false);
    onSubmit(newValue);
  };

  useImperativeHandle(ref, () => ({
    clearFilter: () => {
      setValue([null, null]);
      setHasError(false);
      onSubmit([null, null]);
    },
  }));

  return (
    <FilterContainer
      data-test="numerical-range-filter-container"
      width={RANGE_WIDTH}
      vertical
      justify="center"
      align="start"
    >
      <FormLabel>{Header}</FormLabel>
      <InputContainer>
        <InputNumber
          value={value[0]}
          onChange={handleMinChange}
          placeholder={t('Value greater than')}
          style={{ width: '100%' }}
          data-test="numerical-filter-min-input"
        />
        <StyledDivider>-</StyledDivider>
        <InputNumber
          value={value[1]}
          onChange={handleMaxChange}
          placeholder={t('Value less than')}
          style={{ width: '100%' }}
          data-test="numerical-filter-max-input"
        />
        {hasError && (
          <ErrorMessage>
            {t('Minimum must be strictly less than maximum')}
          </ErrorMessage>
        )}
      </InputContainer>
    </FilterContainer>
  );
}

export default forwardRef(NumericalRangeFilter);
