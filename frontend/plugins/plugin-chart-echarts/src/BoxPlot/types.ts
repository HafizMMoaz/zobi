import { QueryFormData } from '@zobi-ui/core';
import {
  BaseChartProps,
  BaseTransformedProps,
  ContextMenuTransformedProps,
  CrossFilterTransformedProps,
  TitleFormData,
} from '../types';
import { DEFAULT_TITLE_FORM_DATA } from '../constants';

export type BoxPlotQueryFormData = QueryFormData & {
  numberFormat?: string;
  whiskerOptions?: BoxPlotFormDataWhiskerOptions;
  xTickLayout?: BoxPlotFormXTickLayout;
} & TitleFormData;

export type BoxPlotFormDataWhiskerOptions =
  | 'Tukey'
  | 'Min/max (no outliers)'
  | '2/98 percentiles'
  | '5/95 percentiles'
  | '9/91 percentiles'
  | '10/90 percentiles';

export type BoxPlotFormXTickLayout =
  | '45°'
  | '90°'
  | 'auto'
  | 'flat'
  | 'staggered';

// @ts-expect-error
export const DEFAULT_FORM_DATA: BoxPlotQueryFormData = {
  ...DEFAULT_TITLE_FORM_DATA,
};

export interface EchartsBoxPlotChartProps extends BaseChartProps<BoxPlotQueryFormData> {
  formData: BoxPlotQueryFormData;
}

export type BoxPlotChartTransformedProps =
  BaseTransformedProps<BoxPlotQueryFormData> &
    CrossFilterTransformedProps &
    ContextMenuTransformedProps;
