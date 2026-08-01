/* eslint-disable camelcase */

import { QueryResponse, DEFAULT_METRICS } from '@zobi.dev/core';
import { Dataset } from '../types';

export const defineSavedMetrics = (
  datasource: Dataset | QueryResponse | null,
) =>
  datasource?.hasOwnProperty('metrics')
    ? (datasource as Dataset)?.metrics || []
    : DEFAULT_METRICS;
