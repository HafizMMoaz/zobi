import { renderHook, waitFor } from '@testing-library/react';
import { NO_TIME_RANGE, fetchTimeRange } from '@zobi-ui/core';
import { Operators } from 'src/explore/constants';
import { useGetTimeRangeLabel } from './useGetTimeRangeLabel';
import AdhocFilter from '../AdhocFilter';
import { Clauses, ExpressionTypes } from '../types';

jest.mock('@zobi-ui/core', () => ({
  ...jest.requireActual('@zobi-ui/core'),
  fetchTimeRange: jest.fn(),
}));

const mockedFetchTimeRange = fetchTimeRange as jest.Mock;

test('should return empty object if operator is not TEMPORAL_RANGE', () => {
  const adhocFilter = new AdhocFilter({
    expressionType: ExpressionTypes.Simple,
    subject: 'value',
    operator: '>',
    comparator: '10',
    clause: Clauses.Where,
  });
  const { result } = renderHook(() => useGetTimeRangeLabel(adhocFilter));
  expect(result.current).toEqual({});
});

test('should return empty object if expressionType is SQL', () => {
  const adhocFilter = new AdhocFilter({
    expressionType: ExpressionTypes.Sql,
    subject: 'temporal column',
    operator: Operators.TemporalRange,
    comparator: 'Last week',
    clause: Clauses.Where,
  });
  const { result } = renderHook(() => useGetTimeRangeLabel(adhocFilter));
  expect(result.current).toEqual({});
});

test('should get "No filter" label', () => {
  const adhocFilter = new AdhocFilter({
    expressionType: ExpressionTypes.Simple,
    subject: 'temporal column',
    operator: Operators.TemporalRange,
    comparator: NO_TIME_RANGE,
    clause: Clauses.Where,
  });
  const { result } = renderHook(() => useGetTimeRangeLabel(adhocFilter));
  expect(result.current).toEqual({
    actualTimeRange: 'temporal column (No filter)',
    title: 'No filter',
  });
});

test('should get actualTimeRange and title', async () => {
  mockedFetchTimeRange.mockResolvedValue({ value: 'MOCK TIME' });

  const adhocFilter = new AdhocFilter({
    expressionType: ExpressionTypes.Simple,
    subject: 'temporal column',
    operator: Operators.TemporalRange,
    comparator: 'Last week',
    clause: Clauses.Where,
  });

  const { result } = renderHook(() => useGetTimeRangeLabel(adhocFilter));
  await waitFor(() => {
    expect(result.current).toEqual({
      actualTimeRange: 'MOCK TIME',
      title: 'Last week',
    });
  });
});

test('should get actualTimeRange and title when gets an error', async () => {
  mockedFetchTimeRange.mockResolvedValue({ error: 'MOCK ERROR' });

  const adhocFilter = new AdhocFilter({
    expressionType: ExpressionTypes.Simple,
    subject: 'temporal column',
    operator: Operators.TemporalRange,
    comparator: 'Last week',
    clause: Clauses.Where,
  });

  const { result } = renderHook(() => useGetTimeRangeLabel(adhocFilter));
  await waitFor(() => {
    expect(result.current).toEqual({
      actualTimeRange: 'temporal column (Last week)',
      title: 'MOCK ERROR',
    });
  });
});
