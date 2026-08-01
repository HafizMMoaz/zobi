import { QueryFormData } from '@zobi.dev/core';

export const retainFormDataSuffix = (
  formData: QueryFormData,
  controlSuffix: string,
): QueryFormData => {
  /*
   * retain controls by suffix and return a new formData
   * eg:
   * > const fd = { metrics: ['foo', 'bar'], metrics_b: ['zee'], limit: 100, ... }
   * > removeFormDataSuffix(fd, '_b')
   * { metrics: ['zee'], limit: 100, ... }
   * */
  const newFormData: Record<string, any> = {};

  Object.entries(formData)
    .sort(([a], [b]) => {
      // items contained suffix before others
      const weight_a = a.endsWith(controlSuffix) ? 1 : 0;
      const weight_b = b.endsWith(controlSuffix) ? 1 : 0;
      return weight_b - weight_a;
    })
    .forEach(([key, value]) => {
      if (key.endsWith(controlSuffix)) {
        newFormData[key.slice(0, -controlSuffix.length)] = value;
      }

      if (!key.endsWith(controlSuffix) && !(key in newFormData)) {
        // ignore duplication
        newFormData[key] = value;
      }
    });

  return newFormData as QueryFormData;
};

export const removeFormDataSuffix = (
  formData: QueryFormData,
  controlSuffix: string,
): QueryFormData => {
  /*
   * remove unused controls by suffix and return a new formData
   * eg:
   * > const fd = { metrics: ['foo', 'bar'], metrics_b: ['zee'], limit: 100, ... }
   * > removeUnusedFormData(fd, '_b')
   * { metrics: ['foo', 'bar'], limit: 100, ... }
   * */
  const newFormData: Record<string, any> = {};
  Object.entries(formData).forEach(([key, value]) => {
    if (!key.endsWith(controlSuffix)) {
      newFormData[key] = value;
    }
  });

  return newFormData as QueryFormData;
};
