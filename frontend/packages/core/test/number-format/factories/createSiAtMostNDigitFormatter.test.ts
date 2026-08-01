

import {
  NumberFormatter,
  createSiAtMostNDigitFormatter,
} from '@zobi.dev/core';

describe('createSiAtMostNDigitFormatter({ n })', () => {
  test('creates an instance of NumberFormatter', () => {
    const formatter = createSiAtMostNDigitFormatter({ n: 4 });
    expect(formatter).toBeInstanceOf(NumberFormatter);
  });
  test('uses ASCII hyphen-minus (U+002D) for negative numbers, not Unicode minus (U+2212)', () => {
    // This is important for backward compatibility after d3-format v3 upgrade
    const formatter = createSiAtMostNDigitFormatter({ n: 3 });
    const result = formatter(-1000);
    expect(result.charCodeAt(0)).toBe(45); // ASCII hyphen-minus
  });
  test('when n is specified, it formats number in SI format with at most n significant digits', () => {
    const formatter = createSiAtMostNDigitFormatter({ n: 2 });
    expect(formatter(10)).toBe('10');
    expect(formatter(1)).toBe('1');
    expect(formatter(1)).toBe('1');
    expect(formatter(10)).toBe('10');
    expect(formatter(10001)).toBe('10k');
    expect(formatter(10100)).toBe('10k');
    expect(formatter(111000000)).toBe('110M');
    expect(formatter(0.23)).toBe('230m');
    expect(formatter(0)).toBe('0');
    expect(formatter(-10)).toBe('-10');
    expect(formatter(-1)).toBe('-1');
    expect(formatter(-1)).toBe('-1');
    expect(formatter(-10)).toBe('-10');
    expect(formatter(-10001)).toBe('-10k');
    expect(formatter(-10101)).toBe('-10k');
    expect(formatter(-111000000)).toBe('-110M');
    expect(formatter(-0.23)).toBe('-230m');
  });
  test('when n is not specified, it defaults to n=3', () => {
    const formatter = createSiAtMostNDigitFormatter();
    expect(formatter(10)).toBe('10');
    expect(formatter(1)).toBe('1');
    expect(formatter(1)).toBe('1');
    expect(formatter(10)).toBe('10');
    expect(formatter(10001)).toBe('10.0k');
    expect(formatter(10100)).toBe('10.1k');
    expect(formatter(111000000)).toBe('111M');
    expect(formatter(0.23)).toBe('230m');
    expect(formatter(0)).toBe('0');
    expect(formatter(-10)).toBe('-10');
    expect(formatter(-1)).toBe('-1');
    expect(formatter(-1)).toBe('-1');
    expect(formatter(-10)).toBe('-10');
    expect(formatter(-10001)).toBe('-10.0k');
    expect(formatter(-10101)).toBe('-10.1k');
    expect(formatter(-111000000)).toBe('-111M');
    expect(formatter(-0.23)).toBe('-230m');
  });
});
