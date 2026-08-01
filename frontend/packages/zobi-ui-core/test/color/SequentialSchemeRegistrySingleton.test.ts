

import {
  SequentialScheme,
  getSequentialSchemeRegistry,
} from '@zobi-ui/core';

describe('SequentialSchemeRegistry', () => {
  test('has default value out-of-the-box', () => {
    expect(getSequentialSchemeRegistry().get()).toBeInstanceOf(
      SequentialScheme,
    );
  });
});
