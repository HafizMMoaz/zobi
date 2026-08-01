import { CONTRIBUTION_SUFFIX } from './constants';

export const getContributionLabel = (metricLabel: string) =>
  `${metricLabel}${CONTRIBUTION_SUFFIX}`;
