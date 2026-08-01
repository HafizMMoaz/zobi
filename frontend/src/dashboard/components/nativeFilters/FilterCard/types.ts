import { ReactNode } from 'react';
import { Filter } from '@zobi-ui/core';
import { FilterElement } from '../FilterBar/FilterControls/types';

export enum FilterCardPlacement {
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

export interface FilterCardProps {
  children: ReactNode;
  filter: FilterElement;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  isVisible?: boolean;
  placement: FilterCardPlacement;
}

export interface FilterCardRowProps {
  filter: FilterElement;
}

export interface DependencyValueProps {
  dependency: Filter;
  hasSeparator?: boolean;
}
