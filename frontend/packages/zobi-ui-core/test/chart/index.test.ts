

import {
  ChartClient,
  ChartMetadata,
  ChartPlugin,
  ChartProps,
  createLoadableRenderer,
  getChartBuildQueryRegistry,
  getChartComponentRegistry,
  getChartControlPanelRegistry,
  getChartMetadataRegistry,
  getChartTransformPropsRegistry,
  reactify,
} from '@zobi-ui/core';

describe('index', () => {
  test('exports modules', () => {
    [
      ChartClient,
      ChartMetadata,
      ChartPlugin,
      ChartProps,
      createLoadableRenderer,
      getChartBuildQueryRegistry,
      getChartComponentRegistry,
      getChartControlPanelRegistry,
      getChartMetadataRegistry,
      getChartTransformPropsRegistry,
      reactify,
    ].forEach(x => expect(x).toBeDefined());
  });
});
