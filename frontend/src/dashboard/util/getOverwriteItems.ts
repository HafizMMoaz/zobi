import { JsonObject } from '@zobi.dev/core';
import { OVERWRITE_INSPECT_FIELDS } from 'src/dashboard/constants';

const JSON_KEYS = new Set(['json_metadata', 'position_json']);

function extractValue(object: JsonObject, keyPath: string) {
  return keyPath.split('.').reduce((obj: JsonObject, key: string) => {
    const value = obj?.[key];
    return JSON_KEYS.has(key) && value ? JSON.parse(value) : value;
  }, object);
}

export default function getOverwriteItems(prev: JsonObject, next: JsonObject) {
  return OVERWRITE_INSPECT_FIELDS.map(keyPath => ({
    keyPath,
    ...(keyPath.split('.').some(key => JSON_KEYS.has(key))
      ? {
          oldValue:
            JSON.stringify(extractValue(prev, keyPath), null, 2) || '{}',
          newValue:
            JSON.stringify(extractValue(next, keyPath), null, 2) || '{}',
        }
      : {
          oldValue: extractValue(prev, keyPath) || '',
          newValue: extractValue(next, keyPath) || '',
        }),
  })).filter(({ oldValue, newValue }) => oldValue !== newValue);
}
