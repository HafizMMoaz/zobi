import { useTheme } from '@zobi/core/theme';

export const useJsonTreeTheme = () => {
  const theme = useTheme();

  return {
    base00: theme.colorBgContainer,
    base01: theme.colorBgLayout,
    base02: theme.colorBorder,
    base03: theme.colorBorder,
    base04: theme.colorText,
    base05: theme.colorText,
    base06: theme.colorText,
    base07: theme.colorText,
    base08: theme.colorError,
    base09: theme.colorErrorHover,
    base0A: theme.colorErrorText,
    base0B: theme.colorSuccess,
    base0C: theme.colorPrimaryBgHover,
    base0D: theme.colorPrimary,
    base0E: theme.colorPrimaryActive,
    base0F: theme.colorErrorText,
  };
};
