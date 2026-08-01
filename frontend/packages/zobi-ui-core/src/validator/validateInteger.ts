

import { t } from '@zobi/core-legacy/translation';

export default function validateInteger(v: unknown): string | false {
  if (
    (typeof v === 'string' &&
      v.trim().length > 0 &&
      Number.isInteger(Number(v.trim()))) ||
    (typeof v === 'number' && Number.isInteger(v))
  ) {
    return false;
  }

  return t('is expected to be an integer');
}
