import {
  ChartCustomization,
  ChartCustomizationType,
  LegacyChartCustomizationItem,
  LegacyChartCustomizationDataset,
} from '@zobi.dev/core';
import { ChartCustomizationPlugins } from 'src/constants';
import { DASHBOARD_ROOT_ID } from './constants';

export function isLegacyChartCustomizationFormat(
  item: unknown,
): item is LegacyChartCustomizationItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'customization' in item &&
    (item as Record<string, unknown>).customization != null &&
    !('type' in item)
  );
}

function extractDatasetId(
  dataset: string | number | LegacyChartCustomizationDataset | null,
): number {
  if (dataset === null) {
    return 0;
  }
  if (typeof dataset === 'number') {
    return dataset;
  }
  if (typeof dataset === 'string') {
    const parsed = Number.parseInt(dataset, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof dataset === 'object') {
    const { value } = dataset;
    return typeof value === 'number'
      ? value
      : Number.parseInt(String(value), 10) || 0;
  }
  return 0;
}

function extractColumnName(column: string | string[] | null): string {
  if (column === null) {
    return '';
  }
  if (Array.isArray(column)) {
    return column[0] || '';
  }
  return column;
}

export function migrateChartCustomization(
  legacy: LegacyChartCustomizationItem,
): ChartCustomization {
  const { customization } = legacy;
  const datasetId = extractDatasetId(customization.dataset);
  const columnName = extractColumnName(customization.column);

  const controlValues: ChartCustomization['controlValues'] = {
    sortAscending: customization.sortAscending,
    sortMetric: customization.sortMetric,
    canSelectMultiple: customization.canSelectMultiple,
  };

  if (customization.controlValues) {
    Object.assign(controlValues, customization.controlValues);
  }

  let defaultDataMask = customization.defaultDataMask || {
    extraFormData: {},
    filterState: {},
  };

  const filterStateValue = defaultDataMask.filterState?.value;
  if (filterStateValue) {
    const groupbyValue = Array.isArray(filterStateValue)
      ? filterStateValue
      : [filterStateValue];

    defaultDataMask = {
      ...defaultDataMask,
      extraFormData: {
        ...defaultDataMask.extraFormData,
        custom_form_data: {
          ...((defaultDataMask.extraFormData as Record<string, unknown>)
            ?.custom_form_data as Record<string, unknown>),
          groupby: groupbyValue,
        },
      },
      filterState: {
        ...defaultDataMask.filterState,
        label: defaultDataMask.filterState?.label || groupbyValue.join(', '),
        value: filterStateValue,
      },
    };
  }

  const migrated: ChartCustomization = {
    id: legacy.id,
    type: ChartCustomizationType.ChartCustomization,
    name: customization.name || legacy.title || '',
    filterType: ChartCustomizationPlugins.DynamicGroupBy,
    targets: [
      {
        datasetId,
        column: {
          name: columnName,
        },
      },
    ],
    scope: {
      rootPath: [DASHBOARD_ROOT_ID],
      excluded: [],
    },
    chartsInScope: legacy.chartId ? [legacy.chartId] : undefined,
    tabsInScope: undefined,
    cascadeParentIds: [],
    defaultDataMask,
    controlValues,
    description: customization.description,
    removed: legacy.removed,
  };

  return migrated;
}

export function migrateChartCustomizationArray(
  items: unknown[],
): ChartCustomization[] {
  return items
    .filter(
      item =>
        item != null &&
        (isLegacyChartCustomizationFormat(item) ||
          (typeof item === 'object' && 'type' in item)),
    )
    .map(item => {
      if (isLegacyChartCustomizationFormat(item)) {
        return migrateChartCustomization(item);
      }
      return item as ChartCustomization;
    });
}
