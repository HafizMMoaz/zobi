
import {
  CategoricalAirbnb,
  CategoricalEcharts,
  CategoricalZobi,
  CategoricalPreset,
  CategoricalD3,
  CategoricalGoogle,
  CategoricalLyft,
  SequentialCommon,
  SequentialD3,
  CategoricalScheme,
  SequentialScheme,
} from '@zobi-ui/core';

describe('Color Schemes', () => {
  describe('categorical', () => {
    test('returns an array of CategoricalScheme', () => {
      [
        CategoricalAirbnb,
        CategoricalEcharts,
        CategoricalD3,
        CategoricalGoogle,
        CategoricalLyft,
        CategoricalZobi,
        CategoricalPreset,
      ].forEach(group => {
        expect(group).toBeInstanceOf(Array);
        group.forEach(scheme =>
          expect(scheme).toBeInstanceOf(CategoricalScheme),
        );
      });
    });
  });
  describe('sequential', () => {
    test('returns an array of SequentialScheme', () => {
      [SequentialCommon, SequentialD3].forEach(group => {
        expect(group).toBeInstanceOf(Array);
        group.forEach(scheme =>
          expect(scheme).toBeInstanceOf(SequentialScheme),
        );
      });
    });
  });
});
