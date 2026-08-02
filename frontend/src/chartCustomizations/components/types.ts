import { SetDataMaskHook } from '@zobi.dev/core';
import { FilterBarOrientation } from 'src/dashboard/types';

export interface PluginFilterStylesProps {
  height: number;
  width: number;
  orientation?: FilterBarOrientation;
  overflow?: boolean;
}

export interface PluginFilterHooks {
  setDataMask: SetDataMaskHook;
  setFocusedFilter: () => void;
  unsetFocusedFilter: () => void;
  setHoveredFilter: () => void;
  unsetHoveredFilter: () => void;
  setFilterActive: (isActive: boolean) => void;
}
