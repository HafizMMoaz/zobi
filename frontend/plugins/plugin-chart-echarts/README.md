## @zobi-ui/plugin-chart-echarts

[![Version](https://img.shields.io/npm/v/@zobi-ui/plugin-chart-echarts.svg?style=flat)](https://www.npmjs.com/package/@zobi-ui/plugin-chart-echarts)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi-ui%2Fplugin-chart-echarts?style=flat)](https://libraries.io/npm/@zobi-ui%2Fplugin-chart-echarts)

This plugin provides Echarts viz plugins for Zobi:

- Timeseries Chart (combined line, area bar with support for predictive analytics)
- Pie Chart

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import {
  EchartsTimeseriesChartPlugin,
  EchartsPieChartPlugin,
} from '@zobi-ui/plugin-chart-echarts';

new EchartsTimeseriesChartPlugin().configure({ key: 'echarts-ts' }).register();
new EchartsPieChartPlugin().configure({ key: 'pie' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui/?selectedKind=chart-plugins-plugin-chart-echarts)
for more details.

```js
<SuperChart
  chartType="echarts-ts"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```
