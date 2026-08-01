import { omit } from 'lodash';
import {
  ensureIsArray,
  QueryFormData,
  BinaryQueryObjectFilterClause,
  buildQueryObject,
} from '@zobi.dev/core';

export function getDrillPayload(
  queryFormData?: QueryFormData,
  drillFilters?: BinaryQueryObjectFilterClause[],
) {
  if (!queryFormData) {
    return undefined;
  }
  const queryObject = buildQueryObject(queryFormData);
  const extras = omit(queryObject.extras, 'having');
  const filters = [
    ...ensureIsArray(queryObject.filters),
    ...ensureIsArray(drillFilters).map(f => omit(f, 'formattedVal')),
  ];
  return {
    granularity: queryObject.granularity,
    time_range: queryObject.time_range,
    filters,
    extras,
  };
}
