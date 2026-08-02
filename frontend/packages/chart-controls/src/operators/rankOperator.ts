import { PostProcessingRank } from '@zobi.dev/core';
import { PostProcessingFactory } from './types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const rankOperator: PostProcessingFactory<PostProcessingRank> = (
  formData,
  queryObject,
  options,
) => ({
  operation: 'rank',
  options,
});
