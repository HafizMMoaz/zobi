import { Preset } from '@zobi-ui/core';
import ArcChartPlugin from './layers/Arc';
import GeoJsonChartPlugin from './layers/Geojson';
import GridChartPlugin from './layers/Grid';
import HexChartPlugin from './layers/Hex';
import HeatmapChartPlugin from './layers/Heatmap';
import MultiChartPlugin from './Multi';
import PathChartPlugin from './layers/Path';
import PolygonChartPlugin from './layers/Polygon';
import ScatterChartPlugin from './layers/Scatter';
import ScreengridChartPlugin from './layers/Screengrid';
import ContourChartPlugin from './layers/Contour';

export default class DeckGLChartPreset extends Preset {
  constructor() {
    super({
      name: 'deck.gl charts',
      plugins: [
        new ArcChartPlugin().configure({ key: 'deck_arc' }),
        new GeoJsonChartPlugin().configure({ key: 'deck_geojson' }),
        new GridChartPlugin().configure({ key: 'deck_grid' }),
        new HexChartPlugin().configure({ key: 'deck_hex' }),
        new HeatmapChartPlugin().configure({ key: 'deck_heatmap' }),
        new MultiChartPlugin().configure({ key: 'deck_multi' }),
        new PathChartPlugin().configure({ key: 'deck_path' }),
        new PolygonChartPlugin().configure({ key: 'deck_polygon' }),
        new ScatterChartPlugin().configure({ key: 'deck_scatter' }),
        new ScreengridChartPlugin().configure({ key: 'deck_screengrid' }),
        new ContourChartPlugin().configure({ key: 'deck_contour' }),
      ],
    });
  }
}
