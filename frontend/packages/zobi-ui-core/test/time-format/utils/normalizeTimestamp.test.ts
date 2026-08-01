

import normalizeTimestamp from '../../../src/time-format/utils/normalizeTimestamp';

test('normalizeTimestamp should normalize typical timestamps', () => {
  expect(normalizeTimestamp('2023-03-11 08:26:52.695 UTC')).toEqual(
    '2023-03-11T08:26:52.695Z',
  );
  expect(normalizeTimestamp('2023-03-11 08:26:52.695 Europe/Helsinki')).toEqual(
    '2023-03-11T08:26:52.695Z',
  );
  expect(normalizeTimestamp('2023-03-11T08:26:52.695 UTC')).toEqual(
    '2023-03-11T08:26:52.695Z',
  );
  expect(normalizeTimestamp('2023-03-11T08:26:52.695')).toEqual(
    '2023-03-11T08:26:52.695Z',
  );
  expect(normalizeTimestamp('2023-03-11 08:26:52')).toEqual(
    '2023-03-11T08:26:52Z',
  );
});

test('normalizeTimestamp should return unmatched timestamps as-is', () => {
  expect(normalizeTimestamp('abcd')).toEqual('abcd');
  expect(normalizeTimestamp('03/11/2023')).toEqual('03/11/2023');
});
