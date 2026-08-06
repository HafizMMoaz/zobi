import { JsonObject, ZobiApiError, ZobiApiErrorType } from '@zobi.dev/core';
import handleError, {
  ErrorInput,
} from '../../../../src/query/api/v1/handleError';

async function testHandleError(
  inputError: ErrorInput,
  expected: string | JsonObject,
): Promise<ZobiApiError> {
  try {
    await handleError(inputError);
  } catch (error) {
    const typedError = error as ZobiApiError;
    expect(typedError).toBeInstanceOf(ZobiApiError);
    if (typeof expected === 'string') {
      expect(typedError.message).toContain(expected);
    } else {
      expect(typedError).toEqual(expect.objectContaining(expected));
    }
    return typedError;
  }
  return new ZobiApiError({ message: 'Where is the error?' });
}

describe('handleError()', () => {
  test('should throw error directly', async () => {
    expect.assertions(3);
    const input = new ZobiApiError({ message: 'timeout' });
    const output = await testHandleError(input, 'timeout');
    expect(input).toBe(output);
  });

  test('should handle error string', async () => {
    expect.assertions(2);
    await testHandleError('STOP', 'STOP');
  });

  test('should handle HTTP error', async () => {
    expect.assertions(2);
    const mockResponse = new Response('Ha?', {
      status: 404,
      statusText: 'NOT FOUND',
    });
    await testHandleError(mockResponse, '404 NOT FOUND');
  });

  test('should handle HTTP error with status < 400', async () => {
    expect.assertions(2);
    const mockResponse = new Response('Ha haha?', {
      status: 302,
      statusText: 'Found',
    });
    await testHandleError(mockResponse, '302 Found');
  });

  test('should use message from HTTP error', async () => {
    expect.assertions(2);
    const mockResponse = new Response('{ "message": "BAD BAD" }', {
      status: 500,
      statusText: 'Server Error',
    });
    await testHandleError(mockResponse, 'BAD BAD');
  });

  test('should handle response of single error', async () => {
    expect.assertions(2);
    const mockResponse = new Response(
      '{ "error": "BAD BAD", "link": "https://zobi.dev" }',
      {
        status: 403,
        statusText: 'Access Denied',
      },
    );
    await testHandleError(mockResponse, {
      message: 'BAD BAD',
      extra: { link: 'https://zobi.dev' },
    });
  });

  test('should handle single error object', async () => {
    expect.assertions(2);
    const mockError = {
      error: {
        message: 'Request timeout',
        error_type: ZobiApiErrorType.FrontendTimeoutError,
      },
    };
    await testHandleError(mockError, {
      message: 'Request timeout',
      errorType: 'FRONTEND_TIMEOUT_ERROR',
    });
  });

  test('should process multi errors in HTTP json', async () => {
    expect.assertions(2);
    const mockResponse = new Response(
      '{ "errors": [{ "error_type": "NOT OK" }] }',
      {
        status: 403,
        statusText: 'Access Denied',
      },
    );
    await testHandleError(mockResponse, 'NOT OK');
  });

  test('should handle invalid multi errors', async () => {
    expect.assertions(4);
    const mockResponse1 = new Response('{ "errors": [] }', {
      status: 403,
      statusText: 'Access Denied',
    });
    const mockResponse2 = new Response('{ "errors": null }', {
      status: 400,
      statusText: 'Bad Request',
    });
    await testHandleError(mockResponse1, '403 Access Denied');
    await testHandleError(mockResponse2, '400 Bad Request');
  });

  test('should fallback to statusText', async () => {
    expect.assertions(2);
    const mockResponse = new Response('{ "failed": "random ramble" }', {
      status: 403,
      statusText: 'Access Denied',
    });
    await testHandleError(mockResponse, '403 Access Denied');
  });

  test('should handle regular JS error', async () => {
    expect.assertions(4);
    await testHandleError(new Error('What?'), 'What?');
    const emptyError = new Error();
    emptyError.stack = undefined;
    await testHandleError(emptyError, 'Unknown Error');
  });

  test('should handle { error: ... }', async () => {
    expect.assertions(2);
    await testHandleError({ error: 'Hmm' }, 'Hmm');
  });

  test('should throw unknown error', async () => {
    expect.assertions(4);
    await testHandleError(
      Promise.resolve('Some random things') as never,
      'Unknown Error',
    );
    await testHandleError(undefined as never, 'Unknown Error');
  });
});
