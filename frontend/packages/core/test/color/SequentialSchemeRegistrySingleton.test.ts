import { SequentialScheme, getSequentialSchemeRegistry } from '@zobi.dev/core';

describe('SequentialSchemeRegistry', () => {
  test('has default value out-of-the-box', () => {
    expect(getSequentialSchemeRegistry().get()).toBeInstanceOf(
      SequentialScheme,
    );
  });
});
