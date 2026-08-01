import finestTemporalGrain from './finestTemporalGrain';

test('finestTemporalGrain', () => {
  const monthFormatter = finestTemporalGrain([
    new Date('2003-01-01 00:00:00Z').getTime(),
    new Date('2003-02-01 00:00:00Z').getTime(),
  ]);
  expect(monthFormatter(new Date('2003-01-01 00:00:00Z').getTime())).toBe(
    '2003-01-01',
  );
  expect(monthFormatter(new Date('2003-02-01 00:00:00Z').getTime())).toBe(
    '2003-02-01',
  );

  const yearFormatter = finestTemporalGrain([
    new Date('2003-01-01 00:00:00Z').getTime(),
    new Date('2004-01-01 00:00:00Z').getTime(),
  ]);
  expect(yearFormatter(new Date('2003-01-01 00:00:00Z').getTime())).toBe(
    '2003',
  );
  expect(yearFormatter(new Date('2004-01-01 00:00:00Z').getTime())).toBe(
    '2004',
  );

  const milliSecondFormatter = finestTemporalGrain([
    new Date('2003-01-01 00:00:00Z').getTime(),
    new Date('2003-04-05 06:07:08.123Z').getTime(),
  ]);
  expect(milliSecondFormatter(new Date('2003-01-01 00:00:00Z').getTime())).toBe(
    '2003-01-01 00:00:00.000',
  );

  const localTimeFormatter = finestTemporalGrain(
    [
      new Date('2003-01-01 00:00:00Z').getTime(),
      new Date('2003-02-01 00:00:00Z').getTime(),
    ],
    true,
  );
  expect(localTimeFormatter(new Date('2003-01-01 00:00:00Z').getTime())).toBe(
    '2002-12-31 19:00',
  );

  const bigIntFormatter = finestTemporalGrain([
    BigInt(1234567890123456789n),
    BigInt(1234567890123456789n),
  ]);
  expect(bigIntFormatter(new Date('2003-01-01 00:00:00Z').getTime())).toBe(
    '2003',
  );
});
