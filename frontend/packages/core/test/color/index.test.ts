

import {
  BRAND_COLOR,
  CategoricalColorNamespace,
  CategoricalColorScale,
  CategoricalScheme,
  getCategoricalSchemeRegistry,
  getSequentialSchemeRegistry,
  SequentialScheme,
} from '@zobi.dev/core';

describe('index', () => {
  test('exports modules', () => {
    [
      BRAND_COLOR,
      CategoricalColorNamespace,
      CategoricalColorScale,
      CategoricalScheme,
      getCategoricalSchemeRegistry,
      getSequentialSchemeRegistry,
      SequentialScheme,
    ].forEach(x => expect(x).toBeDefined());
  });
});
