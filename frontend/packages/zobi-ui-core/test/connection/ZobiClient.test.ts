import fetchMock from 'fetch-mock';

import { ZobiClient, ZobiClientClass } from '@zobi-ui/core';
import type { ZobiClientInterface } from '@zobi-ui/core';
import { LOGIN_GLOB } from './fixtures/constants';

beforeAll(() => fetchMock.mockGlobal());
afterAll(() => fetchMock.hardReset());

describe('ZobiClient', () => {
  beforeAll(() => fetchMock.get(LOGIN_GLOB, { result: '1234' }));

  afterAll(() => fetchMock.removeRoutes().clearHistory());

  afterEach(() => ZobiClient.reset());

  const clientWithGetUrl = ZobiClient as ZobiClientInterface & {
    getUrl: (...args: unknown[]) => string;
  };

  test('exposes configure, init, get, post, postForm, delete, put, request, reset, getGuestToken, getCSRFToken, getUrl, isAuthenticated, and reAuthenticate methods', () => {
    expect(typeof ZobiClient.configure).toBe('function');
    expect(typeof ZobiClient.init).toBe('function');
    expect(typeof ZobiClient.get).toBe('function');
    expect(typeof ZobiClient.post).toBe('function');
    expect(typeof ZobiClient.postForm).toBe('function');
    expect(typeof ZobiClient.delete).toBe('function');
    expect(typeof ZobiClient.put).toBe('function');
    expect(typeof ZobiClient.request).toBe('function');
    expect(typeof ZobiClient.reset).toBe('function');
    expect(typeof ZobiClient.getGuestToken).toBe('function');
    expect(typeof ZobiClient.getCSRFToken).toBe('function');
    expect(typeof clientWithGetUrl.getUrl).toBe('function');
    expect(typeof ZobiClient.isAuthenticated).toBe('function');
    expect(typeof ZobiClient.reAuthenticate).toBe('function');
  });

  test('throws if you call init, get, post, postForm, delete, put, request, getGuestToken, getCSRFToken, getUrl, isAuthenticated, or reAuthenticate before configure', () => {
    expect(ZobiClient.init).toThrow();
    expect(ZobiClient.get).toThrow();
    expect(ZobiClient.post).toThrow();
    expect(ZobiClient.postForm).toThrow();
    expect(ZobiClient.delete).toThrow();
    expect(ZobiClient.put).toThrow();
    expect(ZobiClient.request).toThrow();
    expect(ZobiClient.getGuestToken).toThrow();
    expect(ZobiClient.getCSRFToken).toThrow();
    expect(clientWithGetUrl.getUrl).toThrow();
    expect(ZobiClient.isAuthenticated).toThrow();
    expect(ZobiClient.reAuthenticate).toThrow();
    expect(ZobiClient.configure).not.toThrow();
  });

  // this also tests that the ^above doesn't throw if configure is called appropriately
  test('calls appropriate ZobiClient methods when configured', async () => {
    expect.assertions(18);
    const mockGetUrl = '/mock/get/url';
    const mockPostUrl = '/mock/post/url';
    const mockRequestUrl = '/mock/request/url';
    const mockPutUrl = '/mock/put/url';
    const mockDeleteUrl = '/mock/delete/url';
    const mockGetPayload = { get: 'payload' };
    const mockPostPayload = { post: 'payload' };
    const mockDeletePayload = { delete: 'ok' };
    const mockPutPayload = { put: 'ok' };
    fetchMock.get(mockGetUrl, mockGetPayload);
    fetchMock.post(mockPostUrl, mockPostPayload);
    fetchMock.delete(mockDeleteUrl, mockDeletePayload);
    fetchMock.put(mockPutUrl, mockPutPayload);
    fetchMock.get(mockRequestUrl, mockGetPayload);

    const initSpy = jest.spyOn(ZobiClientClass.prototype, 'init');
    const getSpy = jest.spyOn(ZobiClientClass.prototype, 'get');
    const postSpy = jest.spyOn(ZobiClientClass.prototype, 'post');
    const putSpy = jest.spyOn(ZobiClientClass.prototype, 'put');
    const deleteSpy = jest.spyOn(ZobiClientClass.prototype, 'delete');
    const authenticatedSpy = jest.spyOn(
      ZobiClientClass.prototype,
      'isAuthenticated',
    );
    const csrfSpy = jest.spyOn(ZobiClientClass.prototype, 'fetchCSRFToken');
    const requestSpy = jest.spyOn(ZobiClientClass.prototype, 'request');
    const getGuestTokenSpy = jest.spyOn(
      ZobiClientClass.prototype,
      'getGuestToken',
    );
    const getUrlSpy = jest.spyOn(ZobiClientClass.prototype, 'getUrl');

    ZobiClient.configure({ appRoot: '/app' });
    expect(clientWithGetUrl.getUrl({ endpoint: '/some/path' })).toContain(
      '/app/some/path',
    );
    expect(getUrlSpy).toHaveBeenCalledTimes(1);

    ZobiClient.configure({});
    await ZobiClient.init();

    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(authenticatedSpy).toHaveBeenCalledTimes(2);
    expect(csrfSpy).toHaveBeenCalledTimes(1);

    await ZobiClient.get({ url: mockGetUrl });
    await ZobiClient.post({ url: mockPostUrl });
    await ZobiClient.delete({ url: mockDeleteUrl });
    await ZobiClient.put({ url: mockPutUrl });
    await ZobiClient.request({ url: mockRequestUrl });

    // Make sure network calls have  Accept: 'application/json' in headers
    const networkCalls = [
      mockGetUrl,
      mockPostUrl,
      mockRequestUrl,
      mockPutUrl,
      mockDeleteUrl,
    ];
    networkCalls.map((url: string) =>
      expect(
        fetchMock.callHistory.calls(url)[0].options?.headers,
      ).toStrictEqual({
        accept: 'application/json',
        'x-csrftoken': '1234',
      }),
    );

    ZobiClient.isAuthenticated();
    await ZobiClient.reAuthenticate();

    ZobiClient.getGuestToken();
    expect(getGuestTokenSpy).toHaveBeenCalledTimes(1);

    expect(initSpy).toHaveBeenCalledTimes(2);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledTimes(5); // request rewires to get
    expect(csrfSpy).toHaveBeenCalledTimes(2); // from init() + reAuthenticate()

    initSpy.mockRestore();
    getSpy.mockRestore();
    putSpy.mockRestore();
    deleteSpy.mockRestore();
    requestSpy.mockRestore();
    postSpy.mockRestore();
    authenticatedSpy.mockRestore();
    csrfSpy.mockRestore();
    getUrlSpy.mockRestore();

    fetchMock.clearHistory().removeRoutes();
  });

  test('getCSRFToken() returns existing token when already configured', async () => {
    ZobiClient.configure({ csrfToken: 'my_token' });
    const token = await ZobiClient.getCSRFToken();
    expect(token).toBe('my_token');
  });
});
