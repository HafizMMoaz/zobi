import { ReactNode } from 'react';
import {
  DataMask,
  DataMaskStateWithId,
  Divider,
  Filter,
  ChartCustomization,
  ChartCustomizationDivider,
} from '@zobi.dev/core';
import { FilterBarOrientation } from 'src/dashboard/types';

interface CommonFiltersBarProps {
  actions: ReactNode;
  canEdit: boolean;
  dataMaskSelected: DataMaskStateWithId;
  filterValues: (Filter | Divider)[];
  chartCustomizationValues: (ChartCustomization | ChartCustomizationDivider)[];
  isInitialized: boolean;
  onSelectionChange: (
    filter: Pick<Filter, 'id'> & Partial<Filter>,
    dataMask: Partial<DataMask>,
  ) => void;
  onPendingCustomizationDataMaskChange: (
    customizationId: string,
    dataMask: DataMask,
  ) => void;
  clearAllTriggers?: Record<string, boolean>;
  onClearAllComplete?: (filterId: string) => void;
}

interface VerticalBarConfig {
  filtersOpen: boolean;
  height: number | string;
  offset: number;
  toggleFiltersBar: any;
  width: number;
}

export interface FiltersBarProps {
  hidden?: boolean;
  orientation: FilterBarOrientation;
  verticalConfig?: VerticalBarConfig;
}

export type HorizontalBarProps = CommonFiltersBarProps & {
  dashboardId: number;
};

export type VerticalBarProps = Omit<FiltersBarProps, 'orientation'> &
  CommonFiltersBarProps &
  VerticalBarConfig;
