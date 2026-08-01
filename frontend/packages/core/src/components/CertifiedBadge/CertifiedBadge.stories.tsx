import { configure as configureTranslation } from '@zobi.dev/extension-api/translation';
import { CertifiedBadge } from '.';
import type { CertifiedBadgeProps } from './types';

configureTranslation();

export default {
  title: 'Components/CertifiedBadgeWithTooltip',
};

export const InteractiveIcon = (args: CertifiedBadgeProps) => (
  <CertifiedBadge {...args} />
);

InteractiveIcon.args = {
  certifiedBy: 'Trusted Authority',
  details: 'All requirements have been met.',
  size: 30,
};
