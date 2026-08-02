import { customTimeRangeEncode } from 'src/explore/components/controls/DateFilterControl/utils';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('Custom TimeRange', () => {
  // eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
  describe('customTimeRangeEncode', () => {
    test('1) specific : specific', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: '2021-01-20T00:00:00',
          sinceMode: 'specific',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: '2021-01-27T00:00:00',
          untilMode: 'specific',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual('2021-01-20T00:00:00 : 2021-01-27T00:00:00');
    });

    test('2) specific : relative', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: '2021-01-20T00:00:00',
          sinceMode: 'specific',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: '2021-01-20T00:00:00',
          untilMode: 'relative',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual(
        '2021-01-20T00:00:00 : DATEADD(DATETIME("2021-01-20T00:00:00"), 7, day)',
      );
    });

    test('3) now : relative', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: 'now',
          sinceMode: 'now',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: 'now',
          untilMode: 'relative',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual('now : DATEADD(DATETIME("now"), 7, day)');
    });

    test('4) today : relative', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: 'today',
          sinceMode: 'today',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: 'today',
          untilMode: 'relative',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual('today : DATEADD(DATETIME("today"), 7, day)');
    });

    test('5) relative : specific', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: '2021-01-27T00:00:00',
          sinceMode: 'relative',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: '2021-01-27T00:00:00',
          untilMode: 'specific',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual(
        'DATEADD(DATETIME("2021-01-27T00:00:00"), -7, day) : 2021-01-27T00:00:00',
      );
    });

    test('6) relative : now', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: 'now',
          sinceMode: 'relative',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: 'now',
          untilMode: 'now',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual('DATEADD(DATETIME("now"), -7, day) : now');
    });

    test('7) relative : today', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: 'today',
          sinceMode: 'relative',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: 'today',
          untilMode: 'today',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual('DATEADD(DATETIME("today"), -7, day) : today');
    });

    test('8) relative : relative (now)', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: 'now',
          sinceMode: 'relative',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: 'now',
          untilMode: 'relative',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual(
        'DATEADD(DATETIME("now"), -7, day) : DATEADD(DATETIME("now"), 7, day)',
      );
    });

    test('9) relative : relative (date/time)', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: '2021-01-27T00:00:00',
          sinceMode: 'relative',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: '2021-01-27T00:00:00',
          untilMode: 'relative',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'specific',
          anchorValue: '2021-01-27T00:00:00',
        }),
      ).toEqual(
        'DATEADD(DATETIME("2021-01-27T00:00:00"), -7, day) : DATEADD(DATETIME("2021-01-27T00:00:00"), 7, day)',
      );
    });
  });
});
