import fetchMock from 'fetch-mock';

import callApiAndParseWithTimeout from '../../../src/connection/callApi/callApiAndParseWithTimeout';

// we import these via * so that we can spy on the 'default' property of the object
import * as callApi from '../../../src/connection/callApi/callApi';
import * as parseResponse from '../../../src/connection/callApi/parseResponse';
import * as rejectAfterTimeout from '../../../src/connection/callApi/rejectAfterTimeout';

import { LOGIN_GLOB } from '../fixtures/constants';

const mockGetUrl = '/mock/get/url';
const mockGetPayload = { get: 'payload' };

beforeAll(() => fetchMock.mockGlobal());
afterAll(() => fetchMock.hardReset());

describe('callApiAndParseWithTimeout()', () => {
  beforeAll(() => fetchMock.get(LOGIN_GLOB, { result: '1234' }));

  beforeEach(() => fetchMock.get(mockGetUrl, mockGetPayload));

  afterEach(() => {
    fetchMock.removeRoutes().clearHistory();
    jest.useRealTimers();
  });

  describe('callApi', () => {
    test('calls callApi()', () => {
      const callApiSpy = jest.spyOn(callApi, 'default');
      callApiAndParseWithTimeout({ url: mockGetUrl, method: 'GET' });

      expect(callApiSpy).toHaveBeenCalledTimes(1);
      callApiSpy.mockClear();
    });
  });

  describe('parseResponse', () => {
    test('calls parseResponse()', async () => {
      const parseSpy = jest.spyOn(parseResponse, 'default');

      await callApiAndParseWithTimeout({
        url: mockGetUrl,
        method: 'GET',
      });

      expect(parseSpy).toHaveBeenCalledTimes(1);
      parseSpy.mockClear();
    });
  });

  describe('timeout', () => {
    test('does not create a rejection timer if no timeout passed', () => {
      const rejectionSpy = jest.spyOn(rejectAfterTimeout, 'default');
      callApiAndParseWithTimeout({ url: mockGetUrl, method: 'GET' });

      expect(rejectionSpy).toHaveBeenCalledTimes(0);
      rejectionSpy.mockClear();
    });

    test('creates a rejection timer if a timeout passed', () => {
      jest.useFakeTimers(); // prevents the timeout from rejecting + failing test
      const rejectionSpy = jest.spyOn(rejectAfterTimeout, 'default');
      callApiAndParseWithTimeout({
        url: mockGetUrl,
        method: 'GET',
        timeout: 10,
      });

      expect(rejectionSpy).toHaveBeenCalledTimes(1);
      rejectionSpy.mockClear();
    });

    test('rejects if the request exceeds the timeout', async () => {
      expect.assertions(2);
      jest.useFakeTimers();

      const mockTimeoutUrl = '/mock/timeout/url';
      const unresolvingPromise = new Promise(() => {});
      let error;
      fetchMock.get(mockTimeoutUrl, () => unresolvingPromise);

      try {
        const promise = callApiAndParseWithTimeout({
          url: mockTimeoutUrl,
          method: 'GET',
          timeout: 1,
        });
        jest.advanceTimersByTime(2);
        await promise;
      } catch (err) {
        error = err;
      } finally {
        expect(fetchMock.callHistory.calls(mockTimeoutUrl)).toHaveLength(1);
        expect(error).toEqual({
          error: 'Request timed out',
          statusText: 'timeout',
          timeout: 1,
        });
      }
    });

    test('resolves if the request does not exceed the timeout', async () => {
      expect.assertions(1);
      const { json } = await callApiAndParseWithTimeout({
        url: mockGetUrl,
        method: 'GET',
        timeout: 100,
      });
      expect(json).toEqual(mockGetPayload);
    });
  });
});
