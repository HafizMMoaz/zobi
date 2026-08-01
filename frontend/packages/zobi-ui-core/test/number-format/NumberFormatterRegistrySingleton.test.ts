

import {
  NumberFormatterRegistry,
  getNumberFormatterRegistry,
  setD3Format,
  getNumberFormatter,
  formatNumber,
} from '@zobi-ui/core';

describe('NumberFormatterRegistrySingleton', () => {
  describe('getNumberFormatterRegistry()', () => {
    test('returns a NumberFormatterRegistry', () => {
      expect(getNumberFormatterRegistry()).toBeInstanceOf(
        NumberFormatterRegistry,
      );
    });
  });
  describe('getNumberFormatter(format)', () => {
    test('returns a format function', () => {
      const format = getNumberFormatter('.3s');
      expect(format(12345)).toEqual('12.3k');
    });
    test('returns a format function even given invalid format', () => {
      const format = getNumberFormatter('xkcd');
      expect(format(12345)).toEqual('12345 (Invalid format: xkcd)');
    });
    test('falls back to default format if format is not specified', () => {
      const formatter = getNumberFormatter();
      expect(formatter.format(100)).toEqual('100');
    });
  });
  describe('formatNumber(format, value)', () => {
    test('format the given number using the specified format', () => {
      const output = formatNumber('.3s', 12345);
      expect(output).toEqual('12.3k');
    });
    test('falls back to the default formatter if the format is undefined', () => {
      expect(formatNumber(undefined, 1000)).toEqual('1k');
    });
  });
  describe('setD3Format()', () => {
    test('sets a specific FormatLocaleDefinition', () => {
      setD3Format({
        decimal: ';',
        thousands: '-',
        currency: ['€', ''],
        grouping: [2],
      });
      const formatter = getNumberFormatter('$,.2f');
      expect(formatter.format(12345.67)).toEqual('€1-23-45;67');
    });
    test('falls back to default value for unspecified locale format parameters', () => {
      setD3Format({
        currency: ['€', ''],
      });
      const formatter = getNumberFormatter('$,.1f');
      expect(formatter.format(12345.67)).toEqual('€12,345.7');
    });
  });
});
