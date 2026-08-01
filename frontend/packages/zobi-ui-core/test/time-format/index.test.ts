

import {
  createD3TimeFormatter,
  createMultiFormatter,
  formatTime,
  getTimeFormatter,
  getTimeFormatterRegistry,
  LOCAL_PREFIX,
  PREVIEW_TIME,
  SMART_DATE_ID,
  SMART_DATE_VERBOSE_ID,
  SMART_DATE_DETAILED_ID,
  createSmartDateFormatter,
  createSmartDateVerboseFormatter,
  createSmartDateDetailedFormatter,
  TimeFormats,
  TimeFormatter,
} from '@zobi-ui/core';

describe('index', () => {
  test('exports modules', () => {
    [
      createD3TimeFormatter,
      createMultiFormatter,
      formatTime,
      getTimeFormatter,
      getTimeFormatterRegistry,
      LOCAL_PREFIX,
      PREVIEW_TIME,
      SMART_DATE_ID,
      SMART_DATE_VERBOSE_ID,
      SMART_DATE_DETAILED_ID,
      createSmartDateFormatter,
      createSmartDateVerboseFormatter,
      createSmartDateDetailedFormatter,
      TimeFormats,
      TimeFormatter,
    ].forEach(x => expect(x).toBeDefined());
  });
});
