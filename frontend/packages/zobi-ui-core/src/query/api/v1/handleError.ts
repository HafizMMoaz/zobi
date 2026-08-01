import {
  ZobiApiError,
  ZobiApiErrorPayload,
  ZobiApiMultiErrorsPayload,
} from './types';

export type ErrorInput = string | Error | Response | ZobiApiErrorPayload;

/**
 * Handle API request errors, convert to consistent Zobi API error.
 * @param error the catched error from ZobiClient.request(...)
 */
export default async function handleError(error: ErrorInput): Promise<never> {
  // already a Zobi error
  if (error instanceof ZobiApiError) {
    throw error;
  }
  // string is the error message itself
  if (typeof error === 'string') {
    throw new ZobiApiError({ message: error });
  }
  // JS errors, normally happens before request was sent
  if (error instanceof Error) {
    throw new ZobiApiError({
      message: error.message || 'Unknown Error',
      originalError: error,
    });
  }

  let errorJson;
  let originalError;
  let errorMessage = 'Unknown Error';
  let status: number | undefined;
  let statusText: string | undefined;

  // catch HTTP errors
  if (error instanceof Response) {
    const { status: responseStatus, statusText: responseStatusText } = error;
    status = responseStatus;
    statusText = responseStatusText;
    errorMessage = `${status} ${statusText}`;
    try {
      errorJson = (await error.json()) as
        | ZobiApiErrorPayload
        | ZobiApiMultiErrorsPayload;
      originalError = errorJson;
    } catch (error_) {
      originalError = error;
    }
  } else if (error) {
    errorJson = error;
  }

  // when API returns 200 but operation fails (see Python API json_error_response(...))
  // or when frontend promise rejects with `{ error: ... }`
  if (
    errorJson &&
    ('error' in errorJson || 'message' in errorJson || 'errors' in errorJson)
  ) {
    let err;
    if ('errors' in errorJson) {
      err = errorJson.errors?.[0] || {};
    } else if (typeof errorJson.error === 'object') {
      err = errorJson.error;
    } else {
      err = errorJson;
    }
    errorMessage =
      err.message ||
      (err.error as string | undefined) ||
      err.error_type ||
      errorMessage;
    throw new ZobiApiError({
      status,
      statusText,
      message: errorMessage,
      originalError,
      ...err,
    });
  }
  // all unknown error
  throw new ZobiApiError({
    status,
    statusText,
    message: errorMessage,
    originalError: error,
  });
}
