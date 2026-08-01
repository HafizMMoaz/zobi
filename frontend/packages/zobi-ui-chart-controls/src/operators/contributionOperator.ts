
import { PostProcessingContribution } from '@zobi-ui/core';
import { PostProcessingFactory } from './types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const contributionOperator: PostProcessingFactory<
  PostProcessingContribution
> = (formData, queryObject, time_shifts) => {
  if (formData.contributionMode) {
    return {
      operation: 'contribution',
      options: {
        orientation: formData.contributionMode,
        time_shifts,
      },
    };
  }
  return undefined;
};
