## @zobi-ui/legacy-plugin-chart-calendar

[![Version](https://img.shields.io/npm/v/@zobi-ui/legacy-plugin-chart-calendar.svg?style=flat)](https://www.npmjs.com/package/@zobi-ui/legacy-plugin-chart-calendar)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi-ui%2Flegacy-plugin-chart-calendar?style=flat)](https://libraries.io/npm/@zobi-ui%2Flegacy-plugin-chart-calendar)

This plugin provides Calendar Heatmap for Zobi.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import CalendarChartPlugin from '@zobi-ui/legacy-plugin-chart-calendar';

new CalendarChartPlugin().configure({ key: 'calendar' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui-plugins/?selectedKind=plugin-chart-calendar)
for more details.

```js
<SuperChart
  chartType="calendar"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```
