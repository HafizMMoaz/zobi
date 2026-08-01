import { act, renderHook, waitFor } from '@testing-library/react';
import { ZobiClient } from '@zobi.dev/core';
import { useDeckLayerMetadata } from './useDeckLayerMetadata';

jest.mock('@zobi.dev/core', () => ({
  ...jest.requireActual('@zobi.dev/core'),
  ZobiClient: {
    get: jest.fn(),
  },
}));

const mockZobiClientGet = ZobiClient.get as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

test('returns empty layers when sliceIds is empty', () => {
  const { result } = renderHook(() => useDeckLayerMetadata([]));

  expect(result.current.layers).toEqual([]);
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBe(null);
});

test('fetches layer metadata successfully', async () => {
  const mockResponse = {
    json: {
      result: [
        { id: 1, slice_name: 'Layer 1', viz_type: 'deck_scatter' },
        { id: 2, slice_name: 'Layer 2', viz_type: 'deck_arc' },
      ],
    },
  };
  mockZobiClientGet.mockResolvedValue(mockResponse);

  const { result } = renderHook(() => useDeckLayerMetadata([1, 2]));

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.layers).toEqual([
    { sliceId: 1, name: 'Layer 1', type: 'deck_scatter' },
    { sliceId: 2, name: 'Layer 2', type: 'deck_arc' },
  ]);
  expect(result.current.error).toBe(null);
  expect(mockZobiClientGet).toHaveBeenCalledWith({
    endpoint: expect.stringContaining('/api/v1/chart/?q='),
  });
});

test('handles API error and returns fallback layers', async () => {
  const errorMessage = 'Network error';
  mockZobiClientGet.mockRejectedValue(new Error(errorMessage));

  const { result } = renderHook(() => useDeckLayerMetadata([1, 2, 3]));

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.error).toBe(errorMessage);
  expect(result.current.layers).toEqual([
    { sliceId: 1, name: 'Layer 1', type: 'unknown' },
    { sliceId: 2, name: 'Layer 2', type: 'unknown' },
    { sliceId: 3, name: 'Layer 3', type: 'unknown' },
  ]);
});

test('handles non-Error object rejection', async () => {
  mockZobiClientGet.mockRejectedValue('String error');

  const { result } = renderHook(() => useDeckLayerMetadata([1]));

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.error).toBe('Unknown error');
  expect(result.current.layers).toEqual([
    { sliceId: 1, name: 'Layer 1', type: 'unknown' },
  ]);
});

test('refetches when sliceIds change', async () => {
  const mockResponse1 = {
    json: {
      result: [{ id: 1, slice_name: 'Layer 1', viz_type: 'deck_scatter' }],
    },
  };
  const mockResponse2 = {
    json: {
      result: [
        { id: 2, slice_name: 'Layer 2', viz_type: 'deck_arc' },
        { id: 3, slice_name: 'Layer 3', viz_type: 'deck_geojson' },
      ],
    },
  };

  mockZobiClientGet
    .mockResolvedValueOnce(mockResponse1)
    .mockResolvedValueOnce(mockResponse2);

  const { result, rerender } = renderHook(
    ({ ids }) => useDeckLayerMetadata(ids),
    {
      initialProps: { ids: [1] },
    },
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.layers).toHaveLength(1);
  expect(result.current.layers[0].sliceId).toBe(1);

  rerender({ ids: [2, 3] });

  await waitFor(() => {
    expect(result.current.layers).toHaveLength(2);
  });

  expect(result.current.isLoading).toBe(false);
  expect(result.current.layers).toHaveLength(2);
  expect(result.current.layers[0].sliceId).toBe(2);
  expect(result.current.layers[1].sliceId).toBe(3);
  expect(mockZobiClientGet).toHaveBeenCalledTimes(2);
});

test('handles empty result from API', async () => {
  const mockResponse = {
    json: {
      result: [],
    },
  };
  mockZobiClientGet.mockResolvedValue(mockResponse);

  const { result } = renderHook(() => useDeckLayerMetadata([1, 2]));

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.layers).toEqual([]);
  expect(result.current.error).toBe(null);
});

test('clears isLoading when sliceIds transitions from non-empty to empty', async () => {
  const mockResponse = {
    json: {
      result: [{ id: 1, slice_name: 'Layer 1', viz_type: 'deck_scatter' }],
    },
  };
  mockZobiClientGet.mockResolvedValue(mockResponse);

  const { result, rerender } = renderHook(
    ({ ids }) => useDeckLayerMetadata(ids),
    {
      initialProps: { ids: [1] },
    },
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.layers).toHaveLength(1);

  act(() => {
    rerender({ ids: [] });
  });

  expect(result.current.isLoading).toBe(false);
  expect(result.current.layers).toEqual([]);
});

test('does not refetch when sliceIds array has same values', async () => {
  const mockResponse = {
    json: {
      result: [{ id: 1, slice_name: 'Layer 1', viz_type: 'deck_scatter' }],
    },
  };
  mockZobiClientGet.mockResolvedValue(mockResponse);

  const { result, rerender } = renderHook(
    ({ ids }) => useDeckLayerMetadata(ids),
    {
      initialProps: { ids: [1] },
    },
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  const callCount = mockZobiClientGet.mock.calls.length;

  rerender({ ids: [1] });

  expect(mockZobiClientGet).toHaveBeenCalledTimes(callCount);
});
