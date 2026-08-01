import { getExtensionsRegistry } from '@zobi.dev/core';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DynamicPluginProvider } from 'src/components';
import { EmbeddedUiConfigProvider } from 'src/components/UiConfigContext';
import { ZobiThemeProvider } from 'src/theme/ThemeProvider';
import { ThemeController } from 'src/theme/ThemeController';
import { type ThemeStorage, ThemeMode } from '@zobi.dev/extension-api/theme';
import { store } from 'src/views/store';
import querystring from 'query-string';

/**
 * In-memory implementation of ThemeStorage interface for embedded contexts.
 * Persistent storage is not required for embedded dashboards.
 */
class ThemeMemoryStorageAdapter implements ThemeStorage {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }
}

const themeController = new ThemeController({
  storage: new ThemeMemoryStorageAdapter(),
  initialMode: ThemeMode.DEFAULT,
});

export const getThemeController = (): ThemeController => themeController;

const extensionsRegistry = getExtensionsRegistry();

export const EmbeddedContextProviders: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const RootContextProviderExtension = extensionsRegistry.get(
    'root.context.provider',
  );

  return (
    <ZobiThemeProvider themeController={themeController}>
      <ReduxProvider store={store}>
        {/* @ts-expect-error react-dnd types not updated for React 18 */}
        <DndProvider backend={HTML5Backend}>
          <EmbeddedUiConfigProvider>
            <DynamicPluginProvider>
              <QueryParamProvider
                adapter={ReactRouter5Adapter}
                options={{
                  searchStringToObject: querystring.parse,
                  objectToSearchString: (object: Record<string, any>) =>
                    querystring.stringify(object, { encode: false }),
                }}
              >
                {RootContextProviderExtension ? (
                  <RootContextProviderExtension>
                    {children}
                  </RootContextProviderExtension>
                ) : (
                  children
                )}
              </QueryParamProvider>
            </DynamicPluginProvider>
          </EmbeddedUiConfigProvider>
        </DndProvider>
      </ReduxProvider>
    </ZobiThemeProvider>
  );
};
