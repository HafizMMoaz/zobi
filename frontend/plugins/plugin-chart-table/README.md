## @zobi-ui/plugin-chart-table

[![Version](https://img.shields.io/npm/v/@zobi-ui/plugin-chart-table.svg?style=flat)](https://www.npmjs.com/package/@zobi-ui/plugin-chart-table)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi-ui%2Fplugin-chart-table?style=flat)](https://libraries.io/npm/@zobi-ui%2Fplugin-chart-table)

This plugin provides Table chart for Zobi.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import TableChartPlugin from '@zobi-ui/plugin-chart-table';

new TableChartPlugin().configure({ key: 'table' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui-plugins/?selectedKind=plugin-chart-table)
for more details.

```js
<SuperChart
  chartType="table"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```
