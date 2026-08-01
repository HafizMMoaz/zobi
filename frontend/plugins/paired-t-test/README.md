## @zobi.dev/paired-t-test

[![Version](https://img.shields.io/npm/v/@zobi.dev/paired-t-test.svg?style=flat)](hhttps://www.npmjs.com/package/@zobi.dev/paired-t-test)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi.dev%2Fplugin-paired-t-test?style=flat)](https://libraries.io/npm/@zobi.dev%2Flegacy-plugin-chart-paired-t-test)

This plugin provides Paired T Test for Zobi.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import PairedTTestChartPlugin from '@zobi.dev/paired-t-test';

new PairedTTestChartPlugin().configure({ key: 'paired-t-test' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui-plugins/?selectedKind=plugin-chart-paired-t-test)
for more details.

```js
<SuperChart
  chartType="paired-t-test"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```
