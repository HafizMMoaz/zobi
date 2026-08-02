import denormalizeTimestamp from '../../../src/time-format/utils/denormalizeTimestamp';

test('denormalizeTimestamp should normalize typical timestamps', () => {
  expect(denormalizeTimestamp('2023-03-11 08:26:52.695 UTC')).toEqual(
    '2023-03-11T08:26:52.695',
  );
  expect(
    denormalizeTimestamp('2023-03-11 08:26:52.695 Europe/Helsinki'),
  ).toEqual('2023-03-11T08:26:52.695');
  expect(denormalizeTimestamp('2023-03-11T08:26:52.695 UTC')).toEqual(
    '2023-03-11T08:26:52.695',
  );
  expect(denormalizeTimestamp('2023-03-11T08:26:52.695')).toEqual(
    '2023-03-11T08:26:52.695',
  );
  expect(denormalizeTimestamp('2023-03-11 08:26:52')).toEqual(
    '2023-03-11T08:26:52',
  );
});

test('denormalizeTimestamp should return unmatched timestamps as-is', () => {
  expect(denormalizeTimestamp('abcd')).toEqual('abcd');
  expect(denormalizeTimestamp('03/11/2023')).toEqual('03/11/2023');
});
