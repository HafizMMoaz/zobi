import { RefObject, ReactElement } from 'react';

import {
  DataMask,
  DataMaskStateWithId,
  Filter,
  ChartCustomization,
} from '@zobi-ui/core';
import { FilterBarOrientation } from 'src/dashboard/types';

export type FilterElement = Filter | ChartCustomization;

export type FilterElementWithDataMask = FilterElement & {
  dataMask?: DataMask;
};

export interface BaseFilterProps {
  orientation?: FilterBarOrientation;
  overflow?: boolean;
}

export interface FilterDividerProps extends BaseFilterProps {
  title: string;
  description: string;
}

export interface FilterControlProps extends BaseFilterProps {
  dataMaskSelected?: DataMaskStateWithId;
  filter: FilterElementWithDataMask;
  icon?: ReactElement;
  focusedFilterId?: string;
  onFilterSelectionChange: (filter: FilterElement, dataMask: DataMask) => void;
  inView?: boolean;
  showOverflow?: boolean;
  parentRef?: RefObject<any>;
  setFilterActive?: (isActive: boolean) => void;
  validateStatus?: string;
  clearAllTrigger?: boolean;
  onClearAllComplete?: () => void;
}
