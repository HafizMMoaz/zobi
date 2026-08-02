import { QueryFormData, QueryObject } from '@zobi.dev/core';

export interface PostProcessingFactory<T> {
  (formData: QueryFormData, queryObject: QueryObject, options?: any): T;
}
