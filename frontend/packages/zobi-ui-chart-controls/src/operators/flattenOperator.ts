
import { PostProcessingFlatten } from '@zobi-ui/core';
import { PostProcessingFactory } from './types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const flattenOperator: PostProcessingFactory<PostProcessingFlatten> = (
  formData,
  queryObject,
) => ({
  operation: 'flatten',
});
