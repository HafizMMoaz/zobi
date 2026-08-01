import { makeApi } from '@zobi.dev/core';
import { act, renderHook } from '@testing-library/react';
import {
  ResourceStatus,
  useApiResourceFullBody,
  useApiV1Resource,
  useTransformedResource,
} from './apiResources';

const fakeApiResult = {
  id: 1,
  name: 'fake api result',
};

const nameToAllCaps = (thing: any) => ({
  ...thing,
  name: thing.name.toUpperCase(),
});

jest.mock('@zobi.dev/core', () => ({
  ...jest.requireActual<any>('@zobi.dev/core'),
  makeApi: jest
    .fn()
    .mockReturnValue(jest.fn().mockResolvedValue(fakeApiResult)),
}));

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('apiResource hooks', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
  describe('useApiResourceFullBody', () => {
    test('returns a loading state at the start', async () => {
      const { result } = renderHook(() =>
        useApiResourceFullBody('/test/endpoint'),
      );
      expect(result.current).toEqual({
        status: ResourceStatus.Loading,
        result: null,
        error: null,
      });
      await act(async () => {
        jest.runAllTimers();
      });
    });

    test('resolves to the value from the api', async () => {
      const { result } = renderHook(() =>
        useApiResourceFullBody('/test/endpoint'),
      );
      await act(async () => {
        jest.runAllTimers();
      });
      expect(result.current).toEqual({
        status: ResourceStatus.Complete,
        result: fakeApiResult,
        error: null,
      });
    });

    test('handles api errors', async () => {
      const fakeError = new Error('fake api error');
      (makeApi as any).mockReturnValue(jest.fn().mockRejectedValue(fakeError));
      const { result } = renderHook(() =>
        useApiResourceFullBody('/test/endpoint'),
      );
      await act(async () => {
        jest.runAllTimers();
      });
      expect(result.current).toEqual({
        status: ResourceStatus.Error,
        result: null,
        error: fakeError,
      });
    });
  });

  // eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
  describe('useTransformedResource', () => {
    test('applies a transformation to the resource', () => {
      const { result } = renderHook(() =>
        useTransformedResource(
          {
            status: ResourceStatus.Complete,
            result: fakeApiResult,
            error: null,
          },
          nameToAllCaps,
        ),
      );
      expect(result.current).toEqual({
        status: ResourceStatus.Complete,
        result: {
          id: 1,
          name: 'FAKE API RESULT',
        },
        error: null,
      });
    });

    test('works while loading', () => {
      const nameToAllCaps = (thing: any) => ({
        ...thing,
        name: thing.name.toUpperCase(),
      });
      const { result } = renderHook(() =>
        useTransformedResource(
          {
            status: ResourceStatus.Loading,
            result: null,
            error: null,
          },
          nameToAllCaps,
        ),
      );
      expect(result.current).toEqual({
        status: ResourceStatus.Loading,
        result: null,
        error: null,
      });
    });
  });

  // eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
  describe('useApiV1Endpoint', () => {
    test('resolves to the value from the api', async () => {
      (makeApi as any).mockReturnValue(
        jest.fn().mockResolvedValue({
          meta: 'data',
          count: 1,
          result: fakeApiResult,
        }),
      );
      const { result } = renderHook(() => useApiV1Resource('/test/endpoint'));
      await act(async () => {
        jest.runAllTimers();
      });
      expect(result.current).toEqual({
        status: ResourceStatus.Complete,
        result: fakeApiResult,
        error: null,
      });
    });
  });
});
