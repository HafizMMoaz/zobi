import { getSelectedText } from '@zobi.dev/core';

test('Returns null if Selection object is null', () => {
  jest.spyOn(window, 'getSelection').mockImplementationOnce(() => null);
  expect(getSelectedText()).toEqual(undefined);
  jest.restoreAllMocks();
});

test('Returns selection text if Selection object is not null', () => {
  jest
    .spyOn(window, 'getSelection')
    .mockImplementationOnce(() => ({ toString: () => 'test string' }) as any);
  expect(getSelectedText()).toEqual('test string');
  jest.restoreAllMocks();
});
