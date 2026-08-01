## @zobi-ui/plugin-chart-cartodiagram

This plugin allows visualizing charts on a map. To do so, the plugin makes use of existing charts and renders them on the
provided locations.

Configuring the charts: Charts will be configured in their respective editors. So all configuration options of any chart are supported.

Configuring the map: For the map, an arbitrary number of background layers (WMS, WFS, XYZ), the initial map extent, the chart background color and border radius, as well as the chart size (per zoom level) can be configured.

### Usage

The plugin is configured in `frontend/src/visualizations/presets/MainPreset.js`.

```js
import { CartodiagramPlugin } from '@zobi-ui/plugin-chart-cartodiagram';

new CartodiagramPlugin().configure({ key: 'cartodiagram' }).register();
```

Default layers can be added to the constructor. These layers will be added to each chart by default (but can be removed by editors). See also `./src/types.ts` for the definitions of types `WmsLayerConf`, `WfsLayerConf` and `XyzLayerConf`.

Example for an XYZ default layer:

```js
import { CartodiagramPlugin } from '@zobi-ui/plugin-chart-cartodiagram';

const opts = {
  defaultLayers: [
    {
      type: 'XYZ',
      url: 'example.com/path/to/xyz/layer',
      title: 'my default layer title',
      attribution: 'my default layer attribution',
    },
  ],
};

new CartodiagramPlugin(opts).configure({ key: 'cartodiagram' }).register();
```

Please note that by default, Zobi rejects requests to third-party domains. If you want to include
layers from those, you have to adjust the CSP settings. See also docs/docs/security/security.mdx.

### Geometry Column

The plugin requires the selection of a geometry column for a dataset.
This is expected to be a GeoJSON-Point-Geometry string in WGS 84/Pseudo-Mercator (EPSG:3857). Other formats and projections
will be supported in the future.
