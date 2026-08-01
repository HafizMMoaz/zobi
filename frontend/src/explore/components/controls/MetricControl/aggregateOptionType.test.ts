
import { AggregateOption } from './aggregateOptionType';

test('AggregateOption type should enforce aggregate_name as string', () => {
  // Test that the type can be properly used
  const validAggregate: AggregateOption = {
    aggregate_name: 'SUM',
  };

  expect(typeof validAggregate.aggregate_name).toBe('string');
  expect(validAggregate.aggregate_name).toBe('SUM');
});

test('AggregateOption should work with various aggregate names', () => {
  const aggregates: AggregateOption[] = [
    { aggregate_name: 'COUNT' },
    { aggregate_name: 'AVG' },
    { aggregate_name: 'MIN' },
    { aggregate_name: 'MAX' },
  ];

  aggregates.forEach(aggregate => {
    expect(typeof aggregate.aggregate_name).toBe('string');
    expect(aggregate.aggregate_name.length).toBeGreaterThan(0);
  });
});
