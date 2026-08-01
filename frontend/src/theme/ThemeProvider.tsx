import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {} from '@zobi-ui/core';
import {
  type AnyThemeConfig,
  type ThemeContextType,
  Theme,
  ThemeMode,
} from '@zobi/core/theme';
import { ThemeController } from './ThemeController';

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  themeController: ThemeController;
}

export function ZobiThemeProvider({
  children,
  themeController,
}: ThemeProviderProps): JSX.Element {
  const [currentTheme, setCurrentTheme] = useState<Theme>(
    themeController.getTheme(),
  );

  const [currentThemeMode, setCurrentThemeMode] = useState<ThemeMode>(
    themeController.getCurrentMode(),
  );

  useEffect(() => {
    // TODO: Once we migrate to react>=18 is should be possible
    // to replace the useState and useEffect with a singular
    // useSyncExternalStore, simplifying quite a bit
    const updateState = (theme: Theme) => {
      setCurrentTheme(theme);
      setCurrentThemeMode(themeController.getCurrentMode());
      document.documentElement.setAttribute(
        'data-theme-mode',
        themeController.getCurrentModeResolved(),
      );
    };
    const unsubscribe = themeController.onChange(updateState);
    updateState(themeController.getTheme());
    return unsubscribe;
  }, [themeController]);

  const setTheme = useCallback(
    (config: AnyThemeConfig) => themeController.setTheme(config),
    [themeController],
  );

  const setThemeMode = useCallback(
    (newMode: ThemeMode) => themeController.setThemeMode(newMode),
    [themeController],
  );

  const resetTheme = useCallback(
    () => themeController.resetTheme(),
    [themeController],
  );

  // setCrudTheme removed - dashboards should NOT modify the global controller

  const setTemporaryTheme = useCallback(
    (config: AnyThemeConfig, themeId?: number | null) =>
      themeController.setTemporaryTheme(config, themeId),
    [themeController],
  );

  const clearLocalOverrides = useCallback(
    () => themeController.clearLocalOverrides(),
    [themeController],
  );

  const getCurrentCrudThemeId = useCallback(
    () => themeController.getCurrentCrudThemeId(),
    [themeController],
  );

  const hasDevOverride = useCallback(
    () => themeController.hasDevOverride(),
    [themeController],
  );

  const canSetMode = useCallback(
    () => themeController.canSetMode(),
    [themeController],
  );

  const canSetTheme = useCallback(
    () => themeController.canSetTheme(),
    [themeController],
  );

  const canDetectOSPreference = useCallback(
    () => themeController.canDetectOSPreference(),
    [themeController],
  );

  const createDashboardThemeProvider = useCallback(
    (themeId: string) => themeController.createDashboardThemeProvider(themeId),
    [themeController],
  );

  const getAppliedThemeId = useCallback(
    () => themeController.getAppliedThemeId(),
    [themeController],
  );

  const contextValue = useMemo(
    () => ({
      theme: currentTheme,
      themeMode: currentThemeMode,
      setTheme,
      setThemeMode,
      resetTheme,
      setTemporaryTheme,
      clearLocalOverrides,
      getCurrentCrudThemeId,
      hasDevOverride,
      canSetMode,
      canSetTheme,
      canDetectOSPreference,
      createDashboardThemeProvider,
      getAppliedThemeId,
    }),
    [
      currentTheme,
      currentThemeMode,
      setTheme,
      setThemeMode,
      resetTheme,
      setTemporaryTheme,
      clearLocalOverrides,
      getCurrentCrudThemeId,
      hasDevOverride,
      canSetMode,
      canSetTheme,
      canDetectOSPreference,
      createDashboardThemeProvider,
      getAppliedThemeId,
    ],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <currentTheme.ZobiThemeProvider>
        {children}
      </currentTheme.ZobiThemeProvider>
    </ThemeContext.Provider>
  );
}

/**
 * React hook to use the theme context
 */
export function useThemeContext(): ThemeContextType {
  const context: ThemeContextType | null = useContext(ThemeContext);

  if (!context)
    throw new Error('useThemeContext must be used within a ThemeProvider');

  return context;
}
