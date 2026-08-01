## @zobi.dev/chord

[![Version](https://img.shields.io/npm/v/@zobi.dev/chord.svg?style=flat)](https://www.npmjs.com/package/@zobi.dev/chord)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi.dev%2Fplugin-chord?style=flat)](https://libraries.io/npm/@zobi.dev%2Flegacy-plugin-chart-chord)

This plugin provides Chord Diagram for Zobi.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import ChordChartPlugin from '@zobi.dev/chord';

new ChordChartPlugin().configure({ key: 'chord' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui-plugins/?selectedKind=plugin-chart-chord)
for more details.

```js
<SuperChart
  chartType="chord"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```
