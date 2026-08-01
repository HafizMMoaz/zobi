## @zobi.dev/echarts

[![Version](https://img.shields.io/npm/v/@zobi.dev/echarts.svg?style=flat)](https://www.npmjs.com/package/@zobi.dev/echarts)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi.dev%2Fplugin-echarts?style=flat)](https://libraries.io/npm/@zobi.dev%2Fplugin-chart-echarts)

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
} from '@zobi.dev/echarts';

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
