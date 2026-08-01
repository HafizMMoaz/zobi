/* eslint-disable camelcase */
import {
  ZobiClientClass,
  ZobiClientInterface,
  StrictJsonObject,
  JsonValue,
  JsonObject,
} from '../../../connection';

export type ParsedResponseType<T> = T extends 'text'
  ? string
  : T extends 'raw' | null
    ? Response
    : JsonValue;

/**
 * Runtime options when calling a Zobi API. Currently only allow overriding
 * ZobiClient instance.
 */
export interface ZobiApiRequestOptions {
  client?: ZobiClientInterface | ZobiClientClass;
}

/**
 * Zobi API error types.
 * Ref: https://github.com/HafizMMoaz/zobi/blob/318e5347bc6f88119725775baa4ab9a398a6f0b0/zobi/errors.py#L24
 *
 * TODO: migrate frontend/@zobi-ui/core/components/ErrorMessage/types.ts over
 */
export enum ZobiApiErrorType {
  // Generic unknown error
  UnknownError = 'UNKNOWN_ERROR',

  // Frontend errors
  FrontendCsrfError = 'FRONTEND_CSRF_ERROR',
  FrontendNetworkError = 'FRONTEND_NETWORK_ERROR',
  FrontendTimeoutError = 'FRONTEND_TIMEOUT_ERROR',

  // DB Engine errors,
  GenericDbEngineError = 'GENERIC_DB_ENGINE_ERROR',

  // Viz errors,
  VizGetDfError = 'VIZ_GET_DF_ERROR',
  UnknownDatasourceTypeError = 'UNKNOWN_DATASOURCE_TYPE_ERROR',
  FailedFetchingDatasourceInfoError = 'FAILED_FETCHING_DATASOURCE_INFO_ERROR',

  // Security access errors,
  TableSecurityAccessError = 'TABLE_SECURITY_ACCESS_ERROR',
  DatasourceSecurityAccessError = 'DATASOURCE_SECURITY_ACCESS_ERROR',
  MissingOwnershipError = 'MISSING_OWNERSHIP_ERROR',
}

/**
 * API Error json response from the backend (or fetch API in the frontend).
 * See SIP-40 and SIP-41: https://github.com/HafizMMoaz/zobi/issues/9298
 */
export interface ZobiApiErrorPayload {
  message?: string; // error message via FlaskAppBuilder, e.g. `response_404(message=...)`
  error_type?: ZobiApiErrorType;
  level?: 'error' | 'warn' | 'info';
  extra?: StrictJsonObject;
  /**
   * Error message returned via `json_error_response`.
   * Ref https://github.com/HafizMMoaz/zobi/blob/8e23d4f369f35724b34b14def8a5a8bafb1d2ecb/zobi/views/base.py#L94
   */
  error?: string | ZobiApiErrorPayload;
  link?: string;
}

export interface ZobiApiMultiErrorsPayload {
  errors: ZobiApiErrorPayload[];
}

export class ZobiApiError extends Error {
  status?: number;

  statusText?: string;

  errorType: ZobiApiErrorType;

  extra: JsonObject;

  originalError?: Error | Response | JsonValue;

  constructor({
    status,
    statusText,
    message,
    link,
    extra,
    stack,
    error_type: errorType,
    originalError,
  }: Omit<ZobiApiErrorPayload, 'error'> & {
    status?: number;
    statusText?: string;
    message: string;
    stack?: Error['stack'];
    // original JavaScript error or backend JSON response captured
    originalError?: ZobiApiError['originalError'];
  }) {
    super(message);
    const originalErrorStack =
      stack ||
      (originalError instanceof Error ? originalError.stack : undefined);
    this.stack =
      originalErrorStack && this.stack
        ? [
            this.stack.split('\n')[0],
            ...originalErrorStack.split('\n').slice(1),
          ].join('\n')
        : this.stack;
    this.name = 'ZobiApiError';
    this.errorType = errorType || ZobiApiErrorType.UnknownError;
    this.extra = extra || {};
    if (link) {
      this.extra.link = link;
    }
    this.status = status;
    this.statusText = statusText;
    this.originalError = originalError;
  }
}
