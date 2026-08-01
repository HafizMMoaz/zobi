/* eslint-disable no-underscore-dangle */

import { QueryFormData } from '@zobi.dev/core';
import { TimeGranularity } from '../time-format';

export default function extractTimegrain(
  formData: QueryFormData,
): TimeGranularity | undefined {
  const { time_grain_sqla, extra_filters, extra_form_data } = formData;
  if (extra_form_data?.time_grain_sqla) {
    return extra_form_data.time_grain_sqla;
  }
  const extra_grain = (extra_filters || []).filter(
    filter => filter.col === '__time_grain',
  );
  if (extra_grain.length) {
    return extra_grain[0].val as TimeGranularity;
  }
  return time_grain_sqla;
}
