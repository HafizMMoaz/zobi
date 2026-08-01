import { JsonObject, StrictJsonValue } from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { ControlFormItemSpec } from '@zobi.dev/chart-controls';
import {
  SHARED_COLUMN_CONFIG_PROPS,
  SharedColumnConfigProp,
} from './constants';
import { ControlFormItemComponents } from './ControlForm';

/**
 * Column formatting configs.
 */
export type ColumnConfig = {
  [key in SharedColumnConfigProp]?: (typeof SHARED_COLUMN_CONFIG_PROPS)[key]['value'];
} & Record<string, StrictJsonValue>;

/**
 * All required info about a column to render the
 * formatting.
 */
export interface ColumnConfigInfo {
  isChildColumn: boolean;
  isTimeComparisonColumn: boolean;
  name: string;
  type?: GenericDataType;
  config: JsonObject;
}

export type ControlFormItemDefaultSpec = ControlFormItemSpec<
  keyof typeof ControlFormItemComponents
>;

export type ColumnConfigFormItem =
  | SharedColumnConfigProp
  | {
      name: SharedColumnConfigProp;
      override: Partial<ControlFormItemDefaultSpec>;
    }
  | { name: string; config: ControlFormItemDefaultSpec };

export type TabLayoutItem = { tab: string; children: ColumnConfigFormItem[][] };

export type ColumnConfigFormLayout = Record<
  GenericDataType,
  ColumnConfigFormItem[][] | TabLayoutItem[]
>;

export function isTabLayoutItem(
  layoutItem: ColumnConfigFormItem[] | TabLayoutItem,
): layoutItem is TabLayoutItem {
  return !!(layoutItem as TabLayoutItem)?.tab;
}

export default {};
