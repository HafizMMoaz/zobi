import { ChartProps, ChartDataResponseResult } from '@zobi-ui/core';
import { zobiTheme } from '@zobi/core/theme';

/**
 * Datasource shape used by Echarts Timeseries and Mixed Timeseries chart props.
 */
export interface EchartsTimeseriesTestDatasource {
  verboseMap?: Record<string, string>;
  columnFormats?: Record<string, string>;
  currencyFormats?: Record<string, { symbol: string; symbolPosition: string }>;
  currencyCodeColumn?: string;
}

const DEFAULT_DATASOURCE: EchartsTimeseriesTestDatasource = {
  verboseMap: {},
  columnFormats: {},
  currencyFormats: {},
};

/**
 * Form data shape that at minimum has datasource and viz_type (used for merging).
 */
export interface EchartsTimeseriesTestFormDataBase {
  datasource?: string;
  viz_type?: string;
  [key: string]: unknown;
}

/**
 * Config for creating Echarts Timeseries-style chart props in tests.
 * Shared by Timeseries and Mixed Timeseries transformProps tests.
 */
export interface CreateEchartsTimeseriesTestChartPropsConfig<TFormData> {
  defaultFormData: TFormData;
  defaultVizType: string;
  defaultQueriesData?: ChartDataResponseResult[];
  formData?: Partial<TFormData>;
  queriesData?: ChartDataResponseResult[];
  datasource?: EchartsTimeseriesTestDatasource;
  annotationData?: Record<string, unknown>;
  width?: number;
  height?: number;
}

/**
 * Creates chart props for Echarts Timeseries-style plugins in tests.
 * Merges partial formData with defaultFormData and builds a ChartProps-like object.
 * Use this to avoid duplicating createTestChartProps in Timeseries and Mixed Timeseries tests.
 *
 * @param config - defaultFormData, defaultVizType, defaultQueriesData, and optional overrides
 * @returns Chart props object typed as TProps (e.g. EchartsTimeseriesChartProps)
 */
export function createEchartsTimeseriesTestChartProps<
  TFormData extends EchartsTimeseriesTestFormDataBase,
  TProps,
>(config: CreateEchartsTimeseriesTestChartPropsConfig<TFormData>): TProps {
  const {
    defaultFormData,
    defaultVizType,
    defaultQueriesData = [],
    formData: partialFormData = {},
    queriesData: customQueriesData,
    datasource: customDatasource,
    annotationData,
    width = 800,
    height = 600,
  } = config;

  const partial = partialFormData as Partial<EchartsTimeseriesTestFormDataBase>;
  const fullFormData = {
    ...defaultFormData,
    ...partialFormData,
    datasource: partial.datasource ?? '3__table',
    viz_type: partial.viz_type ?? defaultVizType,
  } as TFormData;

  const chartProps = new ChartProps({
    formData: fullFormData,
    width,
    height,
    queriesData: customQueriesData ?? defaultQueriesData,
    theme: zobiTheme,
    datasource: customDatasource ?? { ...DEFAULT_DATASOURCE },
    ...(annotationData !== undefined && { annotationData }),
  });

  return {
    ...chartProps,
    formData: fullFormData,
    queriesData: customQueriesData ?? defaultQueriesData,
  } as TProps;
}
