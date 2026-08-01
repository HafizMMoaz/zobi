import {
  getTimeFormatterRegistry,
  SMART_DATE_ID,
  createSmartDateFormatter,
} from '@zobi.dev/core';

import {
  computeYDomain,
  getTimeOrNumberFormatter,
  formatLabel,
} from '../src/utils';

const DATA = [
  {
    key: ['East Asia & Pacific'],
    values: [
      {
        x: -315619200000.0,
        y: 1031863394.0,
      },
      {
        x: -283996800000.0,
        y: 1034767718.0,
      },
    ],
  },
  {
    key: ['South Asia'],
    values: [
      {
        x: -315619200000.0,
        y: 572036107.0,
      },
      {
        x: -283996800000.0,
        y: 584143236.0,
      },
    ],
  },
  {
    key: ['Europe & Central Asia'],
    values: [
      {
        x: -315619200000.0,
        y: 660881033.0,
      },
      {
        x: -283996800000.0,
        y: 668526708.0,
      },
    ],
  },
];

const DATA_WITH_DISABLED_SERIES = [
  {
    disabled: true,
    key: ['East Asia & Pacific'],
    values: [
      {
        x: -315619200000.0,
        y: 1031863394.0,
      },
      {
        x: -283996800000.0,
        y: 1034767718.0,
      },
    ],
  },
  {
    disabled: true,
    key: ['South Asia'],
    values: [
      {
        x: -315619200000.0,
        y: 572036107.0,
      },
      {
        x: -283996800000.0,
        y: 584143236.0,
      },
    ],
  },
  {
    key: ['Europe & Central Asia'],
    values: [
      {
        x: -315619200000.0,
        y: 660881033.0,
      },
      {
        x: -283996800000.0,
        y: 668526708.0,
      },
    ],
  },
];

describe('nvd3/utils', () => {
  beforeEach(() => {
    getTimeFormatterRegistry().registerValue(
      SMART_DATE_ID,
      createSmartDateFormatter(),
    );
  });

  describe('getTimeOrNumberFormatter(format)', () => {
    test('is a function', () => {
      expect(typeof getTimeOrNumberFormatter).toBe('function');
    });
    test('returns a date formatter if format is smart_date', () => {
      const time = new Date(Date.UTC(2018, 10, 21, 22, 11));
      // @ts-expect-error -- getTimeOrNumberFormatter doesn't distinguish return types; accepts Date at runtime
      expect(getTimeOrNumberFormatter('smart_date')(time)).toBe('10:11');
    });
    test('returns a number formatter otherwise', () => {
      expect(getTimeOrNumberFormatter('.3s')(3000000)).toBe('3.00M');
      expect(getTimeOrNumberFormatter(undefined)(3000100)).toBe('3M');
    });
  });

  describe('formatLabel()', () => {
    const verboseMap = {
      foo: 'Foo',
      bar: 'Bar',
    };

    test('formats simple labels', () => {
      expect(formatLabel('foo')).toBe('foo');
      expect(formatLabel(['foo'])).toBe('foo');
      expect(formatLabel(['foo', 'bar'])).toBe('foo, bar');
    });
    test('formats simple labels with lookups', () => {
      expect(formatLabel('foo', verboseMap)).toBe('Foo');
      expect(formatLabel('baz', verboseMap)).toBe('baz');
      expect(formatLabel(['foo'], verboseMap)).toBe('Foo');
      expect(formatLabel(['foo', 'bar', 'baz'], verboseMap)).toBe(
        'Foo, Bar, baz',
      );
    });
    test('deals with time shift properly', () => {
      expect(formatLabel(['foo', '1 hour offset'], verboseMap)).toBe(
        'Foo, 1 hour offset',
      );
      expect(
        formatLabel(['foo', 'bar', 'baz', '2 hours offset'], verboseMap),
      ).toBe('Foo, Bar, baz, 2 hours offset');
    });
  });

  describe('computeYDomain()', () => {
    test('works with invalid data', () => {
      expect(computeYDomain('foo')).toEqual([0, 1]);
    });

    test('works with all series enabled', () => {
      expect(computeYDomain(DATA)).toEqual([572036107.0, 1034767718.0]);
    });

    test('works with some series disabled', () => {
      expect(computeYDomain(DATA_WITH_DISABLED_SERIES)).toEqual([
        660881033.0, 668526708.0,
      ]);
    });
  });
});
