import { validateMapboxStylesUrl } from '@zobi-ui/core';
import './setup';

describe('validateMapboxStylesUrl', () => {
  test('should validate mapbox style URLs', () => {
    expect(
      validateMapboxStylesUrl('mapbox://styles/mapbox/streets-v9'),
    ).toEqual(false);
    expect(
      validateMapboxStylesUrl(
        'mapbox://styles/foobar/clp2dr5r4008a01pcg4ad45m8',
      ),
    ).toEqual(false);
    expect(
      validateMapboxStylesUrl(
        'tile://https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ),
    ).toEqual(false);
  });

  [
    123,
    ['mapbox://styles/mapbox/streets-v9'],
    { url: 'mapbox://styles/mapbox/streets-v9' },
    'https://zobi.dev/',
    'mapbox://tileset/mapbox/streets-v9',
  ].forEach(value => {
    test(`should not validate ${value}`, () => {
      expect(validateMapboxStylesUrl(value)).toEqual(
        'is expected to be a Mapbox/OSM URL (eg. mapbox://styles/...) or a tile server URL (eg. tile://http...)',
      );
    });
  });
});
