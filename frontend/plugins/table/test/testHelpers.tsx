import {
  zobiTheme,
  ThemeProvider,
  EmotionCacheProvider,
  createEmotionCache,
} from '@zobi.dev/extension-api/theme';

const emotionCache = createEmotionCache({
  key: 'test',
});

export function ProviderWrapper(props: any) {
  const { children, theme = zobiTheme } = props;
  return (
    <EmotionCacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </EmotionCacheProvider>
  );
}
