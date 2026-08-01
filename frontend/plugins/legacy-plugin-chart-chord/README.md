## @zobi-ui/legacy-plugin-chart-chord

[![Version](https://img.shields.io/npm/v/@zobi-ui/legacy-plugin-chart-chord.svg?style=flat)](https://www.npmjs.com/package/@zobi-ui/legacy-plugin-chart-chord)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi-ui%2Flegacy-plugin-chart-chord?style=flat)](https://libraries.io/npm/@zobi-ui%2Flegacy-plugin-chart-chord)

This plugin provides Chord Diagram for Zobi.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import ChordChartPlugin from '@zobi-ui/legacy-plugin-chart-chord';

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
