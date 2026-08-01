import { FilterState, QueryFormData, DataRecord } from '@zobi.dev/core';
import { RefObject } from 'react';
import type { RefSelectProps } from '@zobi.dev/core/components';
import { PluginFilterHooks, PluginFilterStylesProps } from '../types';

interface PluginFilterTimeGrainCustomizeProps {
  defaultValue?: string[] | null;
  inputRef?: RefObject<HTMLInputElement>;
}

export type PluginFilterTimeGrainQueryFormData = QueryFormData &
  PluginFilterStylesProps &
  PluginFilterTimeGrainCustomizeProps;

export type PluginFilterTimeGrainProps = PluginFilterStylesProps & {
  data: DataRecord[];
  filterState: FilterState;
  formData: PluginFilterTimeGrainQueryFormData;
  inputRef: RefObject<RefSelectProps>;
} & PluginFilterHooks;

export const DEFAULT_FORM_DATA: PluginFilterTimeGrainCustomizeProps = {
  defaultValue: null,
};
