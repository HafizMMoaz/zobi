import { GenericDataType } from '@zobi.dev/extension-api/common';

export const INPUT_HEIGHT = 32;

export const INPUT_WIDTH = 270;

export const TIME_FILTER_INPUT_WIDTH = 350;

export const FILTER_SUPPORTED_TYPES = {
  filter_time: [GenericDataType.Temporal],
  filter_timegrain: [GenericDataType.Temporal],
  filter_timecolumn: [GenericDataType.Temporal],
  filter_select: [
    GenericDataType.Boolean,
    GenericDataType.String,
    GenericDataType.Numeric,
    GenericDataType.Temporal,
  ],
  filter_range: [GenericDataType.Numeric],
};

export const CHART_CUSTOMIZATION_SUPPORTED_TYPES = {
  customization_dynamic_group_by: [
    GenericDataType.Boolean,
    GenericDataType.String,
    GenericDataType.Numeric,
    GenericDataType.Temporal,
  ],
  customization_timecolumn: [GenericDataType.Temporal],
  customization_timegrain: [GenericDataType.Temporal],
};
