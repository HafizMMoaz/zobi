
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
import { store } from './store';
import '../preamble';
import querystring from 'query-string';

const themeController = new ThemeController();
const extensionsRegistry = getExtensionsRegistry();

export const RootContextProviders: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
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
