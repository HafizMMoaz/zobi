
import { getFormattedUTCTime, convertUTCTimestampToLocal } from '../src/utils';

describe('getFormattedUTCTime', () => {
  test('formats local timestamp for display as UTC date', () => {
    const utcTimestamp = 1420070400000; // 2015-01-01 00:00:00 UTC
    const localTimestamp = convertUTCTimestampToLocal(utcTimestamp);
    const formattedTime = getFormattedUTCTime(
      localTimestamp,
      '%Y-%m-%d %H:%M:%S',
    );

    expect(formattedTime).toEqual('2015-01-01 00:00:00');
  });
});

describe('convertUTCTimestampToLocal', () => {
  test('adjusts timestamp so local Date shows UTC date', () => {
    const utcTimestamp = 1704067200000;
    const adjustedTimestamp = convertUTCTimestampToLocal(utcTimestamp);
    const adjustedDate = new Date(adjustedTimestamp);

    expect(adjustedDate.getFullYear()).toEqual(2024);
    expect(adjustedDate.getMonth()).toEqual(0);
    expect(adjustedDate.getDate()).toEqual(1);
  });

  test('handles month boundaries', () => {
    const utcTimestamp = 1706745600000;
    const adjustedDate = new Date(convertUTCTimestampToLocal(utcTimestamp));

    expect(adjustedDate.getFullYear()).toEqual(2024);
    expect(adjustedDate.getMonth()).toEqual(1);
    expect(adjustedDate.getDate()).toEqual(1);
  });

  test('handles year boundaries', () => {
    const utcTimestamp = 1735689600000;
    const adjustedDate = new Date(convertUTCTimestampToLocal(utcTimestamp));

    expect(adjustedDate.getFullYear()).toEqual(2025);
    expect(adjustedDate.getMonth()).toEqual(0);
    expect(adjustedDate.getDate()).toEqual(1);
  });

  test('adds timezone offset to timestamp', () => {
    const utcTimestamp = 1704067200000;
    const adjustedTimestamp = convertUTCTimestampToLocal(utcTimestamp);
    const expectedOffset =
      new Date(utcTimestamp).getTimezoneOffset() * 60 * 1000;

    expect(adjustedTimestamp - utcTimestamp).toEqual(expectedOffset);
  });
});

describe('integration', () => {
  test('fixes timezone bug for CalHeatMap', () => {
    const febFirst2024UTC = 1706745600000;
    const adjustedDate = new Date(convertUTCTimestampToLocal(febFirst2024UTC));

    expect(adjustedDate.getMonth()).toEqual(1);
    expect(adjustedDate.getDate()).toEqual(1);
  });

  test('both functions work together to display dates correctly', () => {
    const utcTimestamp = 1704067200000;

    // convertUTCTimestampToLocal adjusts UTC for Cal-Heatmap (which interprets as local)
    const localTimestamp = convertUTCTimestampToLocal(utcTimestamp);
    const calHeatmapDate = new Date(localTimestamp);
    expect(calHeatmapDate.getMonth()).toEqual(0);
    expect(calHeatmapDate.getDate()).toEqual(1);

    // getFormattedUTCTime receives LOCAL timestamp (from Cal-Heatmap) and formats it
    const formattedTime = getFormattedUTCTime(localTimestamp, '%Y-%m-%d');
    expect(formattedTime).toContain('2024-01-01');
  });
});
