## @zobi.dev/country-map

[![Version](https://img.shields.io/npm/v/@zobi.dev/country-map.svg?style=flat)](https://www.npmjs.com/package/@zobi.dev/country-map)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi.dev%2Fplugin-country-map?style=flat)](https://libraries.io/npm/@zobi.dev%2Flegacy-plugin-chart-country-map)

This plugin provides Country Map for Zobi.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import CountryMapChartPlugin from '@zobi.dev/country-map';

new CountryMapChartPlugin().configure({ key: 'country-map' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://zobi.github.io/zobi-ui-plugins/?selectedKind=plugin-chart-country-map)
for more details.

```js
<SuperChart
  chartType="country-map"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

### Update Map

To update the country maps or add a new country, run scripts in the Jupyter notebook
`scripts/Country Map GeoJSON Generator.ipynb`.

```bash
pip install geopandas shapely matplotlib notebook
jupyter notebook
```
