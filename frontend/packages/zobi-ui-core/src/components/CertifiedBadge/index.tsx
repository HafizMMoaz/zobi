import { t } from '@zobi/core-legacy/translation';
import { useTheme } from '@zobi/core-legacy/theme';
import { Icons } from '@zobi-ui/core/components/Icons';
import { Tooltip } from '../Tooltip';
import type { CertifiedBadgeProps } from './types';

export function CertifiedBadge({
  certifiedBy,
  details,
  size = 'l',
}: CertifiedBadgeProps) {
  const theme = useTheme();

  return (
    <Tooltip
      id="certified-details-tooltip"
      title={
        <>
          {certifiedBy && (
            <div>
              <strong>{t('Certified by %s', certifiedBy)}</strong>
            </div>
          )}
          <div>{details}</div>
        </>
      }
    >
      <Icons.Certified iconColor={theme.colorPrimary} iconSize={size} />
    </Tooltip>
  );
}
