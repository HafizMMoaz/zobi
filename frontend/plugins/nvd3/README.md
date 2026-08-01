## @zobi.dev/nvd3

[![Version](https://img.shields.io/npm/v/@zobi.dev/nvd3.svg?style=flat)](https://www.npmjs.com/package/@zobi.dev/nvd3)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi.dev%2Fpreset-nvd3?style=flat)](https://libraries.io/npm/@zobi.dev%2Flegacy-preset-chart-nvd3)

This plugin provides Big Number for Zobi.

### Usage

Import the preset and register. This will register all the chart plugins under nvd3.

```js
import { NVD3ChartPreset } from '@zobi.dev/nvd3';

new NVD3ChartPreset().register();
```

or register charts one by one. Configure `key`, which can be any `string`, and register the plugin.
This `key` will be used to lookup this chart throughout the app.

```js
import {
  AreaChartPlugin,
  LineChartPlugin,
} from '@zobi.dev/nvd3';

new AreaChartPlugin().configure({ key: 'area' }).register();
new LineChartPlugin().configure({ key: 'line' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui-plugins/?selectedKind=plugin-chart-nvd3)
for more details.

```js
<SuperChart
  chartType="line"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```
