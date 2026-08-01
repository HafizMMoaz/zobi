## @zobi.dev/parallel-coordinates

[![Version](https://img.shields.io/npm/v/@zobi.dev/parallel-coordinates.svg?style=flat)](https://www.npmjs.com/package/@zobi.dev/parallel-coordinates)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi.dev%2Fplugin-parallel-coordinates?style=flat)](https://libraries.io/npm/@zobi.dev%2Flegacy-plugin-chart-parallel-coordinates)

This plugin provides Parallel Coordinates for Zobi.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import ParallelCoordinatesChartPlugin from '@zobi.dev/parallel-coordinates';

new ParallelCoordinatesChartPlugin()
  .configure({ key: 'parallel-coordinates' })
  .register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui-plugins/?selectedKind=plugin-chart-parallel-coordinates)
for more details.

```js
<SuperChart
  chartType="parallel-coordinates"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```
