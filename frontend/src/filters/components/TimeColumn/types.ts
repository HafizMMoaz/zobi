import {
  Behavior,
  DataRecord,
  FilterState,
  QueryFormData,
} from '@zobi.dev/core';
import { RefObject } from 'react';
import type { RefSelectProps } from '@zobi.dev/core/components';
import { PluginFilterHooks, PluginFilterStylesProps } from '../types';

interface PluginFilterTimeColumnCustomizeProps {
  defaultValue?: string[] | null;
  inputRef?: RefObject<HTMLInputElement>;
}

export type PluginFilterTimeColumnQueryFormData = QueryFormData &
  PluginFilterStylesProps &
  PluginFilterTimeColumnCustomizeProps;

export type PluginFilterTimeColumnProps = PluginFilterStylesProps & {
  behaviors: Behavior[];
  data: DataRecord[];
  filterState: FilterState;
  formData: PluginFilterTimeColumnQueryFormData;
  inputRef: RefObject<RefSelectProps>;
} & PluginFilterHooks;

export const DEFAULT_FORM_DATA: PluginFilterTimeColumnCustomizeProps = {
  defaultValue: null,
};
