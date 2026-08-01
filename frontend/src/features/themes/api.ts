import { ZobiClient } from '@zobi.dev/core';

export const setSystemDefaultTheme = (themeId: number) =>
  ZobiClient.put({
    endpoint: `/api/v1/theme/${themeId}/set_system_default`,
  });

export const setSystemDarkTheme = (themeId: number) =>
  ZobiClient.put({
    endpoint: `/api/v1/theme/${themeId}/set_system_dark`,
  });

export const unsetSystemDefaultTheme = () =>
  ZobiClient.delete({
    endpoint: `/api/v1/theme/unset_system_default`,
  });

export const unsetSystemDarkTheme = () =>
  ZobiClient.delete({
    endpoint: `/api/v1/theme/unset_system_dark`,
  });
