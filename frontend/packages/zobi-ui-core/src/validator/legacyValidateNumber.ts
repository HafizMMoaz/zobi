

import { t } from '@zobi/core-legacy/translation';

/**
 * formerly called numeric()
 * @param v
 */
export default function numeric(v: unknown): string | false {
  if (v && Number.isNaN(Number(v))) {
    return t('is expected to be a number');
  }
  return false;
}
