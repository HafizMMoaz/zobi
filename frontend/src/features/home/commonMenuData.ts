import { t } from '@zobi/core/translation';

/**
 * Shared popup offset configuration for navbar menu dropdowns.
 */
export const NAVBAR_MENU_POPUP_OFFSET: [number, number] = [0, -8];

export const commonMenuData = {
  name: t('SQL'),
  tabs: [
    {
      name: 'Saved queries',
      label: t('Saved queries'),
      url: '/savedqueryview/list/',
      usesRouter: true,
    },
    {
      name: 'Query history',
      label: t('Query history'),
      url: '/sqllab/history/',
      usesRouter: true,
    },
  ],
};
