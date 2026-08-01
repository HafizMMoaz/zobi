import { useMemo } from 'react';
import { Filter, ChartCustomization } from '@zobi-ui/core';
import { useTheme } from '@zobi/core/theme';
import { useSelector } from 'react-redux';
import { RootState } from 'src/dashboard/types';
import { useChartCustomizationFromRedux } from 'src/dashboard/components/nativeFilters/state';
import {
  getRelatedCharts,
  getRelatedChartsForChartCustomization,
} from './getRelatedCharts';

const unfocusedChartStyles = {
  opacity: 0.3,
  pointerEvents: 'none' as const,
};

const EMPTY = {};

const useFilterFocusHighlightStyles = (chartId: number) => {
  const theme = useTheme();

  const focusedChartStyles = useMemo(
    () => ({
      borderColor: theme.colorPrimaryBorder,
      opacity: 1,
      boxShadow: `0px 0px ${theme.sizeUnit * 3}px ${theme.colorPrimary}`,
      pointerEvents: 'auto',
    }),
    [theme],
  );

  const nativeFilters = useSelector((state: RootState) => state.nativeFilters);
  const slices =
    useSelector((state: RootState) => state.sliceEntities.slices) || {};
  const chartCustomizationItems = useChartCustomizationFromRedux();

  const highlightedFilterId =
    nativeFilters?.focusedFilterId || nativeFilters?.hoveredFilterId;
  const highlightedChartCustomizationId = (nativeFilters as any)
    ?.hoveredChartCustomizationId;

  if (!highlightedFilterId && !highlightedChartCustomizationId) {
    return EMPTY;
  }

  if (highlightedFilterId) {
    const relatedCharts = getRelatedCharts(
      highlightedFilterId as string,
      nativeFilters.filters[highlightedFilterId as string] as Filter,
      slices,
    );

    if (relatedCharts.includes(chartId)) {
      return focusedChartStyles;
    }
  }

  if (highlightedChartCustomizationId) {
    const customizationItem = chartCustomizationItems.find(
      item => item.id === highlightedChartCustomizationId,
    );

    if (customizationItem && 'targets' in customizationItem) {
      const relatedCharts = getRelatedChartsForChartCustomization(
        customizationItem as ChartCustomization,
        slices,
      );

      if (relatedCharts.includes(chartId)) {
        return focusedChartStyles;
      }
    }
  }

  // inline styles are used here due to a performance issue when adding/changing a class, which causes a reflow
  return unfocusedChartStyles;
};

export default useFilterFocusHighlightStyles;
