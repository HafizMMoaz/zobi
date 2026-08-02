import { FC, memo, useMemo } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { DataMaskStateWithId } from '@zobi.dev/core';
import { styled } from '@zobi.dev/extension-api/theme';
import { Loading } from '@zobi.dev/core/components';
import { RootState } from 'src/dashboard/types';
import { useChartLayoutItems } from 'src/dashboard/util/useChartLayoutItems';
import { useChartIds } from 'src/dashboard/util/charts/useChartIds';
import { useSelector } from 'react-redux';
import FilterControls from './FilterControls/FilterControls';
import { useChartsVerboseMaps, getFilterBarTestId } from './utils';
import { HorizontalBarProps } from './types';
import FilterBarSettings from './FilterBarSettings';
import crossFiltersSelector from './CrossFilters/selectors';

const HorizontalBar = styled.div`
  ${({ theme }) => `
    padding: ${theme.sizeUnit * 3}px ${theme.sizeUnit * 2}px ${
      theme.sizeUnit * 3
    }px ${theme.sizeUnit * 4}px;
    background: ${theme.colorBgBase};
    box-shadow: inset 0px -2px 2px -1px ${theme.colorSplit};
  `}
`;

const HorizontalBarContent = styled.div`
  ${({ theme }) => `
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    .loading {
      margin: ${theme.sizeUnit * 2}px auto ${theme.sizeUnit * 2}px;
      padding: 0;
    }
  `}
`;

const FilterBarEmptyStateContainer = styled.div`
  ${({ theme }) => `
    font-weight: ${theme.fontWeightStrong};
    color: ${theme.colorText};
    font-size: ${theme.fontSizeSM}px;
    padding-left: ${theme.sizeUnit * 2}px;
  `}
`;

const HorizontalFilterBar: FC<HorizontalBarProps> = ({
  actions,
  dataMaskSelected,
  filterValues,
  chartCustomizationValues,
  isInitialized,
  onSelectionChange,
  onPendingCustomizationDataMaskChange,
  clearAllTriggers,
  onClearAllComplete,
}) => {
  const dataMask = useSelector<RootState, DataMaskStateWithId>(
    state => state.dataMask,
  );
  const chartIds = useChartIds();
  const chartLayoutItems = useChartLayoutItems();
  const verboseMaps = useChartsVerboseMaps();

  const selectedCrossFilters = useMemo(
    () =>
      crossFiltersSelector({
        dataMask,
        chartIds,
        chartLayoutItems,
        verboseMaps,
      }),
    [chartIds, chartLayoutItems, dataMask, verboseMaps],
  );

  const hasFilters =
    filterValues.length > 0 ||
    selectedCrossFilters.length > 0 ||
    chartCustomizationValues.length > 0;

  return (
    <HorizontalBar {...getFilterBarTestId()}>
      <HorizontalBarContent>
        {!isInitialized ? (
          <Loading position="inline-centered" size="s" muted />
        ) : (
          <>
            <FilterBarSettings />
            {!hasFilters && (
              <FilterBarEmptyStateContainer data-test="horizontal-filterbar-empty">
                {t('No filters are currently added to this dashboard.')}
              </FilterBarEmptyStateContainer>
            )}
            {hasFilters && (
              <FilterControls
                dataMaskSelected={dataMaskSelected}
                onFilterSelectionChange={onSelectionChange}
                onPendingCustomizationDataMaskChange={
                  onPendingCustomizationDataMaskChange
                }
                chartCustomizationValues={chartCustomizationValues}
                clearAllTriggers={clearAllTriggers}
                onClearAllComplete={onClearAllComplete}
              />
            )}
            {actions}
          </>
        )}
      </HorizontalBarContent>
    </HorizontalBar>
  );
};
export default memo(HorizontalFilterBar);
