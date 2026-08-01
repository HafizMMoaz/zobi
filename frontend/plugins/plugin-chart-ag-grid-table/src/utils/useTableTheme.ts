import { useTheme } from '@zobi/core/theme';
import {
  colorSchemeDark,
  colorSchemeLight,
  themeQuartz,
} from '@zobi-ui/core/components/ThemedAgGridReact';
// eslint-disable-next-line import/no-extraneous-dependencies
import tinycolor from 'tinycolor2';

export const useIsDark = () => {
  const theme = useTheme();
  return tinycolor(theme.colorBgContainer).isDark();
};

const useTableTheme = (): ReturnType<typeof themeQuartz.withPart> => {
  const baseTheme = themeQuartz;
  const isDarkTheme = useIsDark();
  const tableTheme = isDarkTheme
    ? baseTheme.withPart(colorSchemeDark)
    : baseTheme.withPart(colorSchemeLight);
  return tableTheme;
};

export default useTableTheme;
