/* eslint-disable camelcase */

import { PostProcessingResample } from '@zobi-ui/core';
import { PostProcessingFactory } from './types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const resampleOperator: PostProcessingFactory<PostProcessingResample> = (
  formData,
  queryObject,
) => {
  const resampleZeroFill = formData.resample_method === 'zerofill';
  const resampleMethod = resampleZeroFill ? 'asfreq' : formData.resample_method;
  const resampleRule = formData.resample_rule;
  if (resampleMethod && resampleRule) {
    return {
      operation: 'resample',
      options: {
        method: resampleMethod,
        rule: resampleRule,
        fill_value: resampleZeroFill ? 0 : null,
      },
    };
  }
  return undefined;
};
