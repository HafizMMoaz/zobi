
import { forwardRef } from 'react';
import { css } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { getFilterValueForDisplay } from 'src/dashboard/components/nativeFilters/utils';
import {
  FilterValue,
  FilterItem,
  FilterName,
} from 'src/dashboard/components/FiltersBadge/Styles';
import { Indicator } from 'src/dashboard/components/nativeFilters/selectors';

export interface IndicatorProps {
  indicator: Indicator;
  onClick?: (path: string[]) => void;
}

const FilterIndicator = forwardRef<HTMLButtonElement, IndicatorProps>(
  ({ indicator: { column, name, value, path = [] }, onClick }, ref) => {
    const resultValue = getFilterValueForDisplay(value);
    return (
      <FilterItem
        ref={ref}
        onClick={
          onClick ? () => onClick([...path, `LABEL-${column}`]) : undefined
        }
        tabIndex={-1}
      >
        {onClick && (
          <i>
            <Icons.SearchOutlined
              iconSize="m"
              css={css`
                span {
                  vertical-align: 0;
                }
              `}
            />
          </i>
        )}
        <div>
          <FilterName>
            {name}
            {resultValue ? ': ' : ''}
          </FilterName>
          <FilterValue>{resultValue}</FilterValue>
        </div>
      </FilterItem>
    );
  },
);

export default FilterIndicator;
