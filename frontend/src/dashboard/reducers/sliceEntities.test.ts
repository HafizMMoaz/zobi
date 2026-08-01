import {
  FETCH_ALL_SLICES_FAILED,
  FETCH_ALL_SLICES_STARTED,
  ADD_SLICES,
} from 'src/dashboard/actions/sliceEntities';

import sliceEntitiesReducer from 'src/dashboard/reducers/sliceEntities';

type ReducerState = Parameters<typeof sliceEntitiesReducer>[0];
type ReducerAction = Parameters<typeof sliceEntitiesReducer>[1];

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('sliceEntities reducer', () => {
  test('should return initial state', () => {
    expect(
      sliceEntitiesReducer(
        {} as Parameters<typeof sliceEntitiesReducer>[0],
        {} as Parameters<typeof sliceEntitiesReducer>[1],
      ),
    ).toEqual({});
  });

  test('should set loading when fetching slices', () => {
    expect(
      sliceEntitiesReducer(
        { isLoading: false } as ReducerState,
        { type: FETCH_ALL_SLICES_STARTED } as ReducerAction,
      ).isLoading,
    ).toBe(true);
  });

  test('should set slices', () => {
    const result = sliceEntitiesReducer(
      { slices: { a: {} } } as unknown as ReducerState,
      {
        type: ADD_SLICES,
        payload: { slices: { 1: {}, 2: {} } },
      } as unknown as ReducerAction,
    );

    expect(result.slices).toEqual({
      1: {},
      2: {},
      a: {},
    });
    expect(result.isLoading).toBe(false);
  });

  test('should set an error on error', () => {
    const result = sliceEntitiesReducer(
      {} as ReducerState,
      {
        type: FETCH_ALL_SLICES_FAILED,
        payload: { error: 'failed' },
      } as ReducerAction,
    );
    expect(result.isLoading).toBe(false);
    expect(result.errorMessage!.indexOf('failed')).toBeGreaterThan(-1);
  });
});
