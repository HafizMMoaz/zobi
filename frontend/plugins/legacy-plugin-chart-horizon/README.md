## @zobi-ui/legacy-plugin-chart-horizon

[![Version](https://img.shields.io/npm/v/@zobi-ui/legacy-plugin-chart-horizon.svg?style=flat)](https://www.npmjs.com/package/@zobi-ui/legacy-plugin-chart-horizon)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi-ui%2Flegacy-plugin-chart-horizon?style=flat)](https://libraries.io/npm/@zobi-ui%2Flegacy-plugin-chart-horizon)

This plugin provides Horizon for Zobi.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import HorizonChartPlugin from '@zobi-ui/legacy-plugin-chart-horizon';

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
