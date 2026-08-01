
import { QueryFormData, QueryObject } from '@zobi-ui/core';

export interface PostProcessingFactory<T> {
  (formData: QueryFormData, queryObject: QueryObject, options?: any): T;
}
