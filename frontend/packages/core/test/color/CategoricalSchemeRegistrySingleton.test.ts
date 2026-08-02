import {
  CategoricalScheme,
  getCategoricalSchemeRegistry,
} from '@zobi.dev/core';

describe('CategoricalSchemeRegistry', () => {
  test('has default value out-of-the-box', () => {
    expect(getCategoricalSchemeRegistry().get()).toBeInstanceOf(
      CategoricalScheme,
    );
  });
});
