import _JSONbig from 'json-bigint';
import { cloneDeepWith } from 'lodash';

import { ParseMethod, TextResponse, JsonResponse } from '../types';

const JSONbig = _JSONbig({
  constructorAction: 'preserve',
});

export default async function parseResponse<T extends ParseMethod = 'json'>(
  apiPromise: Promise<Response>,
  parseMethod?: T,
) {
  type ReturnType = T extends 'raw' | null
    ? Response
    : T extends 'json' | 'json-bigint' | undefined
      ? JsonResponse
      : T extends 'text'
        ? TextResponse
        : never;
  const response = await apiPromise;
  // reject failed HTTP requests with the raw response
  if (!response.ok) {
    return Promise.reject(response);
  }
  if (parseMethod === null || parseMethod === 'raw') {
    return response as ReturnType;
  }
  if (parseMethod === 'text') {
    const text = await response.text();
    const result: TextResponse = {
      response,
      text,
    };
    return result as ReturnType;
  }
  if (parseMethod === 'json-bigint') {
    const rawData = await response.text();
    const json = JSONbig.parse(rawData);
    const result: JsonResponse = {
      response,
      json: cloneDeepWith(json, (value: any) => {
        if (
          value?.isInteger?.() === true &&
          (value?.isGreaterThan?.(Number.MAX_SAFE_INTEGER) ||
            value?.isLessThan?.(Number.MIN_SAFE_INTEGER))
        ) {
          // toFixed() avoids scientific notation, which BigInt() rejects.
          return BigInt(value.toFixed());
        }
        // // `json-bigint` could not handle floats well, see sidorares/json-bigint#62
        // // TODO: clean up after json-bigint>1.0.1 is released
        if (value?.isNaN?.() === false) {
          return value?.toNumber?.();
        }
        return undefined;
      }),
    };
    return result as ReturnType;
  }
  // by default treat this as json
  if (parseMethod === undefined || parseMethod === 'json') {
    const json = await response.json();
    const result: JsonResponse = {
      json,
      response,
    };
    return result as ReturnType;
  }
  throw new Error(
    `Expected parseResponse=json|json-bigint|text|raw|null, got '${parseMethod}'.`,
  );
}
