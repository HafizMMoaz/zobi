## @zobi-ui/plugin-chart-word-cloud

[![Version](https://img.shields.io/npm/v/@zobi-ui/plugin-chart-word-cloud.svg?style=flat)](https://www.npmjs.com/package/@zobi-ui/plugin-chart-word-cloud)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi-ui%2Fplugin-chart-word-cloud?style=flat)](https://libraries.io/npm/@zobi-ui%2Fplugin-chart-word-cloud)

This plugin provides Word Cloud for Zobi.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import WordCloudChartPlugin from '@zobi-ui/plugin-chart-word-cloud';

new WordCloudChartPlugin().configure({ key: 'word-cloud' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui-plugins/?selectedKind=plugin-chart-word-cloud)
for more details.

```js
<SuperChart
  chartType="word-cloud"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```
