import { Suspense, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
} from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { css } from '@zobi.dev/extension-api/theme';
import { Layout, Loading } from '@zobi.dev/core/components';
import { setupAGGridModules } from '@zobi.dev/core/components/ThemedAgGridReact';
import { ErrorBoundary } from 'src/components';
import Menu from 'src/features/home/Menu';
import getBootstrapData, { applicationRoot } from 'src/utils/getBootstrapData';
import ToastContainer from 'src/components/MessageToasts/ToastContainer';
import setupApp from 'src/setup/setupApp';
import setupPlugins from 'src/setup/setupPlugins';
import { routes, isFrontendRoute } from 'src/views/routes';
import { Logger, LOG_ACTIONS_SPA_NAVIGATION } from 'src/logger/LogUtils';
import setupCodeOverrides from 'src/setup/setupCodeOverrides';
import { logEvent } from 'src/logger/actions';
import { store } from 'src/views/store';
import ExtensionsStartup from 'src/extensions/ExtensionsStartup';
import { RootContextProviders } from './RootContextProviders';
import { ScrollToTop } from './ScrollToTop';

setupApp();
setupPlugins();
setupCodeOverrides();
setupAGGridModules();

const bootstrapData = getBootstrapData();

// WCAG 3.1.2: Set the HTML lang attribute based on the current locale
// so screen readers announce the correct language for the page content.
// Normalize to BCP-47 format by replacing underscores with hyphens
// so region subtags like "pt_BR" become valid "pt-BR" rather than being dropped.
const locale =
  bootstrapData.common?.locale || window.navigator.language || 'en';
document.documentElement.lang = String(locale).replace(/_/g, '-');

let lastLocationPathname: string;

const boundActions = bindActionCreators({ logEvent }, store.dispatch);

const LocationPathnameLogger = () => {
  const location = useLocation();
  useEffect(() => {
    // This will log client side route changes for single page app user navigation
    boundActions.logEvent(LOG_ACTIONS_SPA_NAVIGATION, {
      path: location.pathname,
    });
    // reset performance logger timer start point to avoid soft navigation
    // cause dashboard perf measurement problem
    if (lastLocationPathname && lastLocationPathname !== location.pathname) {
      Logger.markTimeOrigin();
    }
    lastLocationPathname = location.pathname;
  }, [location.pathname]);
  return <></>;
};

const App = () => (
  <Router basename={applicationRoot()}>
    <ScrollToTop />
    <LocationPathnameLogger />
    <RootContextProviders>
      <Menu
        data={bootstrapData.common.menu_data}
        isFrontendRoute={isFrontendRoute}
      />
      <ExtensionsStartup>
        <Switch>
          {routes.map(({ path, Component, props = {}, Fallback = Loading }) => (
            <Route path={path} key={path}>
              <Suspense fallback={<Fallback />}>
                <Layout>
                  <Layout.Content
                    css={css`
                      display: flex;
                      flex-direction: column;
                    `}
                  >
                    <ErrorBoundary
                      css={css`
                        margin: 16px;
                      `}
                    >
                      <Component user={bootstrapData.user} {...props} />
                    </ErrorBoundary>
                  </Layout.Content>
                </Layout>
              </Suspense>
            </Route>
          ))}
        </Switch>
      </ExtensionsStartup>
      <ToastContainer />
    </RootContextProviders>
  </Router>
);

export default App;
