import { NativeFilterScope } from '@zobi.dev/core';
import { LayoutItem } from '../types';
import { getChartIdsInFilterScope } from './getChartIdsInFilterScope';
import { findTabsWithChartsInScope } from '../components/nativeFilters/utils';

export interface ScopeItem {
  id: string;
  scope?: NativeFilterScope;
}

export interface CalculatedScope {
  id: string;
  chartsInScope: number[];
  tabsInScope: string[];
}

export function calculateScopes<T extends ScopeItem>(
  items: T[],
  chartIds: number[],
  chartLayoutItems: LayoutItem[],
  isDivider: (item: T) => boolean = () => false,
): CalculatedScope[] {
  return items.map(item => {
    if (isDivider(item)) {
      return {
        id: item.id,
        tabsInScope: [],
        chartsInScope: [],
      };
    }

    if (!item.scope || !Array.isArray(item.scope.excluded)) {
      return {
        id: item.id,
        tabsInScope: [],
        chartsInScope: [],
      };
    }

    const chartsInScope = getChartIdsInFilterScope(
      item.scope,
      chartIds,
      chartLayoutItems,
    );

    const tabsInScope = findTabsWithChartsInScope(
      chartLayoutItems,
      chartsInScope,
    );

    return {
      id: item.id,
      tabsInScope: Array.from(tabsInScope),
      chartsInScope,
    };
  });
}
