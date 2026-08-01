

import {
  createD3NumberFormatter,
  createDurationFormatter,
  createSiAtMostNDigitFormatter,
  createMemoryFormatter,
  formatNumber,
  getNumberFormatter,
  getNumberFormatterRegistry,
  NumberFormats,
  NumberFormatter,
  PREVIEW_VALUE,
} from '@zobi-ui/core';

describe('index', () => {
  test('exports modules', () => {
    [
      createD3NumberFormatter,
      createDurationFormatter,
      createSiAtMostNDigitFormatter,
      createMemoryFormatter,
      formatNumber,
      getNumberFormatter,
      getNumberFormatterRegistry,
      NumberFormats,
      NumberFormatter,
      PREVIEW_VALUE,
    ].forEach(x => expect(x).toBeDefined());
  });
});
