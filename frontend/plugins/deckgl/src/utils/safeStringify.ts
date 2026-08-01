/* eslint-disable consistent-return */

import { JsonObject } from '@zobi.dev/core';

/**
 * A Stringify function that will not crash when it runs into circular JSON references,
 * unlike JSON.stringify. Any circular references are simply omitted, as if there had
 * been no data present
 * @param object any JSON object to be stringified
 */

// eslint-disable-next-line import/prefer-default-export
export function safeStringify(object: JsonObject) {
  const cache = new Set();

  return JSON.stringify(object, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        // We've seen this object before
        try {
          // Quick deep copy to duplicate if this is a repeat rather than a circle.
          return JSON.parse(JSON.stringify(value));
        } catch (error) {
          // Discard key if value cannot be duplicated.
          return;
        }
      }
      // Store the value in our cache.
      cache.add(value);
    }

    return value;
  });
}
