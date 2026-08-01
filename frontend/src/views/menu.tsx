import 'src/public-path';

// Menu App. Used in views that do not already include the Menu component in the layout.
// eg, backend rendered views
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
import createCache from '@emotion/cache';
import { ThemeProvider } from '@zobi/core/theme';
import { theme } from '@zobi/core/theme';
import Menu from 'src/features/home/Menu';
import getBootstrapData from 'src/utils/getBootstrapData';
import { setupStore } from './store';
import querystring from 'query-string';

// Disable connecting to redux debugger so that the React app injected
// Below the menu like SqlLab or Explore can connect its redux store to the debugger
const store = setupStore({ disableDebugger: true });
const bootstrapData = getBootstrapData();
const menu = { ...bootstrapData.common.menu_data };

const emotionCache = createCache({
  key: 'menu',
});

const app = (
  <CacheProvider value={emotionCache}>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <BrowserRouter>
          <QueryParamProvider
            adapter={ReactRouter5Adapter}
            options={{
              searchStringToObject: querystring.parse,
              objectToSearchString: (object: Record<string, any>) =>
                querystring.stringify(object, { encode: false }),
            }}
          >
            <Menu data={menu} />
          </QueryParamProvider>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </CacheProvider>
);

const menuMountPoint = document.getElementById('app-menu');
if (menuMountPoint) {
  createRoot(menuMountPoint).render(app);
}
