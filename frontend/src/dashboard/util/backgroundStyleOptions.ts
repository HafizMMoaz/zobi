import { t } from '@zobi.dev/extension-api/translation';
import { BACKGROUND_TRANSPARENT, BACKGROUND_WHITE } from './constants';

export default [
  {
    value: BACKGROUND_TRANSPARENT,
    label: t('Transparent'),
    className: 'background--transparent',
  },
  {
    value: BACKGROUND_WHITE,
    label: t('Solid'),
    className: 'background--white',
  },
];
