/* eslint-disable theme-colors/no-literal-colors */
import { type SerializableThemeConfig, ThemeAlgorithm } from './types';

const exampleThemes: Record<string, SerializableThemeConfig> = {
  zobi: {
    token: {
      colorBgElevated: '#fafafa',
    },
  },
  zobiDark: {
    token: {},
    algorithm: ThemeAlgorithm.DARK,
  },
  zobiCompact: {
    token: {},
    algorithm: ThemeAlgorithm.COMPACT,
  },
  funky: {
    token: {
      colorPrimary: '#f759ab', // hot pink
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#40a9ff',
      borderRadius: 12,
      fontFamily: 'Comic Sans MS, cursive',
    },
    algorithm: ThemeAlgorithm.DEFAULT,
  },
  funkyDark: {
    token: {
      colorPrimary: '#f759ab', // hot pink
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#40a9ff',
      borderRadius: 12,
      fontFamily: 'Comic Sans MS, cursive',
    },
    algorithm: ThemeAlgorithm.DARK,
  },
};
export default exampleThemes;
