import rison from 'rison';
import {
  ZobiClient,
  Payload as ZobiPayload,
  JsonObject,
  JsonValue,
  ParseMethod,
  Endpoint,
  Method,
  RequestBase,
} from '../../../connection';
import handleError, { ErrorInput } from './handleError';
import {
  ZobiApiRequestOptions,
  ZobiApiErrorPayload,
  ParsedResponseType,
} from './types';

const validRequestTypes = new Set(['form', 'json', 'search', 'rison']);

interface ZobiApiFactoryOptions extends Omit<RequestBase, 'url'> {
  /**
   * API endpoint, must be relative.
   */
  endpoint: Endpoint;
  /**
   * Request method: 'GET' | 'POST' | 'DELETE' | 'PUT' | ...
   */
  method: Method;
  /**
   * How to send the payload:
   *  - form: set request.body as FormData
   *  - json: as JSON string with request Content-Type header set to application/json
   *  - search: add to search params
   */
  requestType?: 'form' | 'json' | 'search' | 'rison';
}

function isPayloadless(method?: Method) {
  return (
    !method || method === 'GET' || method === 'DELETE' || method === 'HEAD'
  );
}

/**
 * Generate an API caller with predefined configs/typing and consistent
 * return values.
 */
export default function makeApi<
  Payload = ZobiPayload,
  Result = JsonObject,
  T extends ParseMethod = ParseMethod,
>(
  options: ZobiApiFactoryOptions & {
    /**
     * How to parse response, choose from: 'json' | 'text' | 'raw'.
     */
    responseType?: T;
    /**
     * Further process parsed response
     */
    processResponse?(result: ParsedResponseType<T>): Result;
  },
) {
  const {
    endpoint,
    method,
    requestType: requestType_,
    responseType,
    processResponse,
    ...requestOptions
  } = options;
  // use `search` payload (searchParams) when it's a GET request
  const requestType =
    requestType_ || (isPayloadless(method) ? 'search' : 'json');
  if (!validRequestTypes.has(requestType)) {
    throw new Error(
      `Invalid request payload type, choose from: ${[...validRequestTypes].join(
        ' | ',
      )}`,
    );
  }

  async function request(
    payload: Payload,
    { client = ZobiClient }: ZobiApiRequestOptions = {
      client: ZobiClient,
    },
  ): Promise<Result> {
    try {
      const requestConfig = {
        ...requestOptions,
        method,
        endpoint,
        searchParams: undefined as URLSearchParams | undefined,
        postPayload: undefined as FormData | undefined,
        jsonPayload: undefined as JsonObject | undefined,
      };
      if (requestType === 'search') {
        requestConfig.searchParams = payload as unknown as URLSearchParams;
      } else if (requestType === 'rison') {
        requestConfig.endpoint = `${endpoint}?q=${rison.encode(payload)}`;
      } else if (requestType === 'form') {
        requestConfig.postPayload = payload as unknown as FormData;
      } else {
        requestConfig.jsonPayload = payload as JsonObject;
      }

      let result: JsonValue | Response;
      const response = await client.request({
        ...requestConfig,
        parseMethod: 'raw',
      });

      if (responseType === 'text') {
        result = await response.text();
      } else if (responseType === 'raw' || responseType === null) {
        result = response;
      } else {
        result = await response.json();
        // if response json has an "error" field
        if (result && typeof result === 'object' && 'error' in result) {
          return handleError(result as ZobiApiErrorPayload);
        }
      }
      const typedResult = result as ParsedResponseType<T>;
      return (
        processResponse ? processResponse(typedResult) : typedResult
      ) as Result;
    } catch (error) {
      return handleError(error as ErrorInput);
    }
  }

  request.method = method;
  request.endpoint = endpoint;
  request.requestType = requestType;

  return request;
}
