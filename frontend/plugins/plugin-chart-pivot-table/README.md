## @zobi-ui/plugin-chart-pivot-table

[![Version](https://img.shields.io/npm/v/@zobi-ui/plugin-chart-pivot-table.svg?style=flat)](https://www.npmjs.com/package/@zobi-ui/plugin-chart-pivot-table)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi-ui%2Fplugin-chart-pivot-table?style=flat)](https://libraries.io/npm/@zobi-ui%2Fplugin-chart-pivot-table)

This plugin provides Pivot Table for Zobi.

If you change the logic of this plugin, please update
[`pivot_table`](https://github.com/HafizMMoaz/zobi/blob/master/zobi/charts/post_processing.py).

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import PivotTableChartPlugin from '@zobi-ui/plugin-chart-pivot-table';

new PivotTableChartPlugin().configure({ key: 'pivot-table-v2' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui/?selectedKind=plugin-chart-pivot-table)
for more details.

```js
<SuperChart
  chartType="pivot-table-v2"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

### File structure generated

```
├── package.json
├── README.md
├── tsconfig.json
├── src
│   ├── PivotTableChart.tsx
│   ├── images
│   │   └── thumbnail.png
│   ├── index.ts
│   ├── plugin
│   │   ├── buildQuery.ts
│   │   ├── controlPanel.ts
│   │   ├── index.ts
│   │   └── transformProps.ts
│   └── types.ts
├── test
│   └── index.test.ts
└── types
    └── external.d.ts
```
