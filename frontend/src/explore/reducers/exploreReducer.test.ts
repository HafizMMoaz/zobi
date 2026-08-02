import exploreReducer, { ExploreState } from './exploreReducer';
import { setStashFormData } from '../actions/exploreActions';
import { QueryFormData } from '@zobi.dev/core';

test('reset hiddenFormData on SET_STASH_FORM_DATA', () => {
  const initialState: ExploreState = {
    form_data: { a: 3, c: 4 } as unknown as QueryFormData,
    controls: {},
  };
  const action = setStashFormData(true, ['a', 'c']) as Parameters<
    typeof exploreReducer
  >[1];
  const newState = exploreReducer(initialState, action);
  expect(newState.form_data).toEqual({});
  expect(newState.hiddenFormData).toEqual({ a: 3, c: 4 });
  const restoreAction = setStashFormData(false, ['c']) as Parameters<
    typeof exploreReducer
  >[1];
  const newState2 = exploreReducer(newState, restoreAction);
  expect(newState2.form_data).toEqual({ c: 4 });
  expect(newState2.hiddenFormData).toEqual({ a: 3 });
});

test('skips updates when the field is already updated on SET_STASH_FORM_DATA', () => {
  const initialState: ExploreState = {
    form_data: { a: 3, c: 4 } as unknown as QueryFormData,
    hiddenFormData: { b: 2 } as unknown as Partial<QueryFormData>,
    controls: {},
  };
  const restoreAction = setStashFormData(false, ['c', 'd']) as Parameters<
    typeof exploreReducer
  >[1];
  const newState = exploreReducer(initialState, restoreAction);
  expect(newState).toBe(initialState);
});
