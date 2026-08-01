import { RefObject } from 'react';
import {
  Behavior,
  DataRecord,
  FilterState,
  QueryFormData,
} from '@zobi-ui/core';
import { PluginFilterHooks, PluginFilterStylesProps } from '../types';

interface PluginFilterTimeCustomizeProps {
  defaultValue?: string | null;
}

export type PluginFilterSelectQueryFormData = QueryFormData &
  PluginFilterStylesProps &
  PluginFilterTimeCustomizeProps;

export type PluginFilterTimeProps = PluginFilterStylesProps & {
  behaviors: Behavior[];
  data: DataRecord[];
  formData: PluginFilterSelectQueryFormData;
  filterState: FilterState;
  inputRef: RefObject<HTMLInputElement>;
  isOverflowingFilterBar?: boolean;
} & PluginFilterHooks;

export const DEFAULT_FORM_DATA: PluginFilterTimeCustomizeProps = {
  defaultValue: null,
};
