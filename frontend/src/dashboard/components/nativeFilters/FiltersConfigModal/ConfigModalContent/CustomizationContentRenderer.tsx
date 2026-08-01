import { memo, useMemo } from 'react';
import {
  ChartCustomization,
  ChartCustomizationType,
  ChartCustomizationDivider,
} from '@zobi.dev/core';
import type { FormInstance } from '@zobi.dev/core/components';
import FiltersConfigForm from '../FiltersConfigForm/FiltersConfigForm';
import DividerConfigForm from '../DividerConfigForm';
import { NativeFiltersForm, FilterRemoval } from '../types';
import { CHART_CUSTOMIZATION_DIVIDER_PREFIX } from '../utils';

export interface CustomizationContentRendererProps {
  chartCustomizationIds: string[];
  renderedIds: string[];
  removedItems: Record<string, FilterRemoval>;
  chartCustomizationConfigMap: Record<
    string,
    ChartCustomization | ChartCustomizationDivider
  >;
  isItemActive: (id: string) => boolean;
  expanded: boolean;
  form: FormInstance<NativeFiltersForm>;
  restoreItem: (id: string) => void;
  activeFilterPanelKey: string | string[];
  handleActiveFilterPanelChange: (key: string | string[]) => void;
  handleSetErroredCustomizations: (
    updater: (filters: string[]) => string[],
  ) => void;
  handleModifyItem: (id: string) => void;
}

function CustomizationContentRenderer({
  chartCustomizationIds,
  renderedIds,
  removedItems,
  chartCustomizationConfigMap,
  isItemActive,
  expanded,
  form,
  restoreItem,
  activeFilterPanelKey,
  handleActiveFilterPanelChange,
  handleSetErroredCustomizations,
  handleModifyItem,
}: CustomizationContentRendererProps) {
  const customizationFormList = useMemo(
    () =>
      chartCustomizationIds.map(id => {
        if (!renderedIds.includes(id)) return null;
        const isDivider = id.startsWith(CHART_CUSTOMIZATION_DIVIDER_PREFIX);
        const isActive = isItemActive(id);
        return (
          <div
            key={id}
            style={{
              height: '100%',
              overflowY: 'auto',
              display: isActive ? '' : 'none',
            }}
          >
            {isDivider ? (
              <DividerConfigForm
                componentId={id}
                divider={
                  chartCustomizationConfigMap[id] as ChartCustomizationDivider
                }
              />
            ) : (
              <FiltersConfigForm
                filterId={id}
                itemType="chartCustomization"
                form={form}
                removedFilters={removedItems}
                restoreFilter={restoreItem}
                customizationToEdit={
                  chartCustomizationConfigMap[id]?.type ===
                  ChartCustomizationType.ChartCustomization
                    ? (chartCustomizationConfigMap[id] as ChartCustomization)
                    : undefined
                }
                expanded={expanded}
                getAvailableFilters={() => []}
                handleActiveFilterPanelChange={handleActiveFilterPanelChange}
                activeFilterPanelKeys={activeFilterPanelKey}
                isActive={isActive}
                setErroredFilters={handleSetErroredCustomizations}
                validateDependencies={() => {}}
                getDependencySuggestion={() => ''}
                onModifyFilter={handleModifyItem}
              />
            )}
          </div>
        );
      }),
    [
      chartCustomizationIds,
      renderedIds,
      removedItems,
      handleSetErroredCustomizations,
      isItemActive,
      form,
      restoreItem,
      chartCustomizationConfigMap,
      expanded,
      handleModifyItem,
      handleActiveFilterPanelChange,
      activeFilterPanelKey,
    ],
  );

  return <>{customizationFormList}</>;
}

export default memo(CustomizationContentRenderer);
