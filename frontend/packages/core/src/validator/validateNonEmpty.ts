import { t } from '@zobi.dev/extension-api/translation';

export default function validateNonEmpty(v: unknown): string | false {
  if (
    v === null ||
    typeof v === 'undefined' ||
    v === '' ||
    (Array.isArray(v) && v.length === 0)
  ) {
    return t('cannot be empty');
  }
  return false;
}
