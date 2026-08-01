## @zobi.dev/world-map

[![Version](https://img.shields.io/npm/v/@zobi.dev/world-map.svg?style=flat)](https://www.npmjs.com/package/@zobi.dev/world-map)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi.dev%2Fplugin-world-map?style=flat)](https://libraries.io/npm/@zobi.dev%2Flegacy-plugin-chart-world-map)

This plugin provides World Map for Zobi.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import WorldmapChartPlugin from '@zobi.dev/world-map';

new WorldmapChartPlugin().configure({ key: 'world-map' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui-plugins/?selectedKind=plugin-chart-world-map)
for more details.

```js
<SuperChart
  chartType="world-map"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```
