import {
  Behavior,
  DataRecord,
  FilterState,
  QueryFormData,
} from '@zobi.dev/core';
import { RefObject } from 'react';
import { PluginFilterHooks, PluginFilterStylesProps } from '../types';
import { FilterBarOrientation } from '../../../dashboard/types';

export enum RangeDisplayMode {
  Slider = 'slider',
  Input = 'input',
  SliderAndInput = 'slider-and-input',
}

interface PluginFilterSelectCustomizeProps {
  max?: number;
  min?: number;
  rangeDisplayMode?: RangeDisplayMode;
}

export type PluginFilterRangeQueryFormData = QueryFormData &
  PluginFilterStylesProps &
  PluginFilterSelectCustomizeProps;

export type PluginFilterRangeProps = PluginFilterStylesProps & {
  data: DataRecord[];
  formData: PluginFilterRangeQueryFormData;
  filterState: FilterState;
  behaviors: Behavior[];
  inputRef: RefObject<any>;
  filterBarOrientation?: FilterBarOrientation;
  isOverflowingFilterBar?: boolean;
} & PluginFilterHooks;
