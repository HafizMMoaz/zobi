import { TimeLocaleDefinition } from 'd3-time-format';
import {
  createD3TimeFormatter,
  PREVIEW_TIME,
  TimeFormats,
} from '@zobi.dev/core';

const thLocale: TimeLocaleDefinition = {
  dateTime: '%a %e %b %Y %X',
  date: '%d/%m/%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: [
    'วันอาทิตย์',
    'วันจันทร์',
    'วันอังคาร',
    'วันพุธ',
    'วันพฤหัส',
    'วันศุกร์',
    'วันเสาร์',
  ],
  shortDays: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ', 'ศ.', 'ส.'],
  months: [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ],
  shortMonths: [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ],
};

describe('createD3TimeFormatter(config)', () => {
  test('requires config.formatString', () => {
    // @ts-expect-error
    expect(() => createD3TimeFormatter()).toThrow();
    // @ts-expect-error
    expect(() => createD3TimeFormatter({})).toThrow();
  });
  describe('config.useLocalTime', () => {
    test('if falsy, formats in UTC time', () => {
      const formatter = createD3TimeFormatter({
        formatString: TimeFormats.DATABASE_DATETIME,
      });
      expect(formatter.format(PREVIEW_TIME)).toEqual('2017-02-14 11:22:33');
    });
    test('if true, formats in local time', () => {
      const formatter = createD3TimeFormatter({
        formatString: TimeFormats.DATABASE_DATETIME,
        useLocalTime: true,
      });
      const formatterInUTC = createD3TimeFormatter({
        formatString: TimeFormats.DATABASE_DATETIME,
      });
      const offset = new Date(PREVIEW_TIME.valueOf()).getTimezoneOffset(); // in minutes
      const expected =
        offset === 0
          ? '2017-02-14 11:22:33'
          : formatterInUTC(
              new Date(PREVIEW_TIME.valueOf() - 60 * 1000 * offset),
            );
      expect(formatter.format(PREVIEW_TIME)).toEqual(expected);
    });
  });

  describe('config.locale', () => {
    const TEST_TIME = new Date(Date.UTC(2015, 11, 20));
    test('supports locale customization (utc time)', () => {
      const formatter = createD3TimeFormatter({
        formatString: '%c',
        locale: thLocale,
      });
      expect(formatter(TEST_TIME)).toEqual('อา. 20 ธ.ค. 2015 00:00:00');
    });
    test('supports locale customization (local time)', () => {
      const formatter = createD3TimeFormatter({
        formatString: '%c',
        locale: thLocale,
        useLocalTime: true,
      });
      const formatterInUTC = createD3TimeFormatter({
        formatString: '%c',
        locale: thLocale,
      });
      const offset = new Date(PREVIEW_TIME.valueOf()).getTimezoneOffset();
      const expected =
        offset === 0
          ? 'อา. 20 ธ.ค. 2015 00:00:00'
          : formatterInUTC(new Date(TEST_TIME.valueOf() - 60 * 1000 * offset));
      expect(formatter(TEST_TIME)).toEqual(expected);
    });
  });
});
