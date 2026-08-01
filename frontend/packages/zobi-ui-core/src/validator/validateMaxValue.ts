import { t } from '@zobi/core-legacy/translation';

export default function validateMaxValue(
  v: unknown,
  max: number,
): string | false {
  if (Number(v) > +max) {
    return t('Value cannot exceed %s', max);
  }
  return false;
}
