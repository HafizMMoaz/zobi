
import { WfsLayerConf } from '../../src/types';
import {
  createLayer,
  createWfsLayer,
  createWmsLayer,
  createXyzLayer,
} from '../../src/util/layerUtil';

describe('layerUtil', () => {
  describe('createWmsLayer', () => {
    test('exists', () => {
      // function is trivial
      expect(createWmsLayer).toBeDefined();
    });
  });

  describe('createWfsLayer', () => {
    test('properly applies style', async () => {
      const colorToExpect = '#123456';
      const fillColor = '#ff0000';

      const wfsLayerConf: WfsLayerConf = {
        title: 'osm:osm-fuel',
        url: 'https://ows-demo.terrestris.de/geoserver/osm/wfs',
        type: 'WFS',
        version: '2.0.2',
        typeName: 'osm:osm-fuel',
        style: {
          name: 'Default Style',
          rules: [
            {
              name: 'Default Rule',
              symbolizers: [
                {
                  kind: 'Line',
                  color: '#000000',
                  width: 2,
                },
                {
                  kind: 'Mark',
                  wellKnownName: 'circle',
                  color: colorToExpect,
                },
                {
                  kind: 'Fill',
                  color: fillColor,
                },
              ],
            },
          ],
        },
      };

      const wfsLayer = await createWfsLayer(wfsLayerConf);

      const style = wfsLayer!.getStyle();
      // @ts-expect-error
      expect(style!.length).toEqual(3);

      // @ts-expect-error upgrade `ol` package for better type of StyleLike type.
      const colorAtLayer = style![2].getFill().getColor();
      expect(colorAtLayer).toEqual(fillColor);
    });
  });

  describe('createXyzLayer', () => {
    test('exists', () => {
      // function is trivial
      expect(createXyzLayer).toBeDefined();
    });
  });

  describe('createLayer', () => {
    test('exists', () => {
      expect(createLayer).toBeDefined();
    });
  });
});
