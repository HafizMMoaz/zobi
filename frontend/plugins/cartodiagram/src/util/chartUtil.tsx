import { ZobiTheme } from '@zobi.dev/extension-api/theme';
import { ChartConfig, ChartConfigFeature } from '../types';
import ChartWrapper from '../components/ChartWrapper';

/**
 * Create a chart component for a location.
 *
 * @param chartVizType The zobi visualization type
 * @param chartConfigs The chart configurations
 * @param chartWidth The chart width
 * @param chartHeight The chart height
 * @param chartTheme The chart theme
 * @returns The chart as React component
 */
export const createChartComponent = (
  chartVizType: string,
  chartConfig: ChartConfigFeature,
  chartWidth: number,
  chartHeight: number,
  chartTheme: ZobiTheme,
  chartLocale: string,
) => (
  <ChartWrapper
    vizType={chartVizType}
    chartConfig={chartConfig}
    width={chartWidth}
    height={chartHeight}
    theme={chartTheme}
    locale={chartLocale}
  />
);

/**
 * Simplifies a chart configuration by removing
 * non-serializable properties.
 *
 * @param config The chart configuration to simplify.
 * @returns The simplified chart configuration.
 */
export const simplifyConfig = (config: ChartConfig) => {
  const simplifiedConfig: ChartConfig = {
    type: config.type,
    features: config.features.map(f => ({
      type: f.type,
      geometry: f.geometry,
      properties: Object.keys(f.properties)
        .filter(k => k !== 'refs')
        .reduce((prev, cur) => ({ ...prev, [cur]: f.properties[cur] }), {}),
    })),
  };
  return simplifiedConfig;
};

/**
 * Check if two chart configurations are equal (deep equality).
 *
 * @param configA The first chart config for comparison.
 * @param configB The second chart config for comparison.
 * @returns True, if configurations are equal. False otherwise.
 */
export const isChartConfigEqual = (
  configA: ChartConfig,
  configB: ChartConfig,
) => {
  const simplifiedConfigA = simplifyConfig(configA);
  const simplifiedConfigB = simplifyConfig(configB);
  return (
    JSON.stringify(simplifiedConfigA) === JSON.stringify(simplifiedConfigB)
  );
};
