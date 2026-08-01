## @zobi.dev/horizon

[![Version](https://img.shields.io/npm/v/@zobi.dev/horizon.svg?style=flat)](https://www.npmjs.com/package/@zobi.dev/horizon)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi.dev%2Fplugin-horizon?style=flat)](https://libraries.io/npm/@zobi.dev%2Flegacy-plugin-chart-horizon)

This plugin provides Horizon for Zobi.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import HorizonChartPlugin from '@zobi.dev/horizon';

new HorizonChartPlugin().configure({ key: 'horizon' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui-plugins/?selectedKind=plugin-chart-horizon)
for more details.

```js
<SuperChart
  chartType="horizon"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```
