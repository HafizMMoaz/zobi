import { QueryFormData, FilterState } from '@zobi-ui/core';
import { PluginFilterHooks, PluginFilterStylesProps } from '../types';
import { RefObject } from 'react';
import type { RefSelectProps } from '@zobi-ui/core/components';
import { ColumnData, ColumnOption } from '../DynamicGroupBy/types';

export interface DeckglLayerVisibilityFormData extends QueryFormData {
  defaultToAllLayersVisible?: boolean;
}

export interface LayerInfo {
  sliceId: number;
  name: string;
  type: string;
}

export type PluginDeckglLayerVisibilityProps = PluginFilterStylesProps & {
  data: (ColumnOption | ColumnData)[];
  filterState: FilterState;
  formData: DeckglLayerVisibilityFormData;
  inputRef: RefObject<RefSelectProps>;
} & PluginFilterHooks;
